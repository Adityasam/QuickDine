import functools
import json
import os
import shutil
import sqlite3
import time
from datetime import datetime, timedelta, timezone

from flask import Flask, g, jsonify, request, send_from_directory, session
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from werkzeug.utils import secure_filename

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("DB_PATH", os.path.join(BASE_DIR, "db.sqlite3"))
MENU_IMAGE_PATH = os.path.join(BASE_DIR, "menuImages")
BUILD_DIR = os.path.join(BASE_DIR, "frontend", "build")

# ponytail: Asia/Kolkata has no DST, so a fixed offset is exact. Dates in DB are stored as naive UTC.
IST = timezone(timedelta(hours=5, minutes=30))
LOCAL = "'+330 minutes'"
LDATE = f"date(OrderTime, {LOCAL})"
LHOUR = f"CAST(strftime('%H', OrderTime, {LOCAL}) AS INTEGER)"

ROLES = ("admin", "staff", "kitchen")
PAID = ("P", "R")  # legacy data: R = payment received
CANCELLED = ("R", "X")

AUDITED = {"category", "menuitem", "menuoption", "optiongroup"}
DEFAULTS = {
    "category": {"Active": True, "Deleted": False},
    "menuitem": {"Available": True, "Deleted": False, "Description": "", "PreparationTime": 0, "Price": 0},
    "menuoption": {"Active": True, "Deleted": False, "Price": 0},
    "optiongroup": {"Active": True, "Deleted": False, "MaxSelection": 1},
    "table": {"Deleted": False},
    "myuser": {"Active": True, "Deleted": False},
}

sqlite3.register_converter("bool", lambda b: b not in (b"0", b""))
sqlite3.register_converter("datetime", lambda b: datetime.fromisoformat(b.decode()).replace(tzinfo=timezone.utc))


def migrate():
    """Schema additions on top of the Django-made DB. Idempotent."""
    c = sqlite3.connect(DB_PATH)
    if "Role" not in {r[1] for r in c.execute("PRAGMA table_info(main_myuser)")}:
        # existing users keep full access
        c.execute("ALTER TABLE main_myuser ADD COLUMN Role varchar(20) NOT NULL DEFAULT 'admin'")
    c.execute("""CREATE TABLE IF NOT EXISTS main_servicerequest (
        id integer PRIMARY KEY AUTOINCREMENT, TableNo varchar(200) NOT NULL, Type varchar(10) NOT NULL,
        CustomerId varchar(100), Status varchar(1) NOT NULL DEFAULT 'O', CreatedAt datetime NOT NULL)""")
    c.execute("CREATE UNIQUE INDEX IF NOT EXISTS main_order_code_uniq ON main_order (Code)")
    c.commit()
    c.close()


migrate()


class JSONProvider(DefaultJSONProvider):
    @staticmethod
    def default(o):
        return o.isoformat() if isinstance(o, datetime) else DefaultJSONProvider.default(o)


app = Flask(__name__, static_folder=None)
app.json = JSONProvider(app)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-change-me")
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])


# ---------- DB helpers ----------

def db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
        g.db.row_factory = lambda c, r: {d[0]: v for d, v in zip(c.description, r)}
    return g.db


@app.teardown_appcontext
def close_db(_):
    if "db" in g:
        g.pop("db").close()


def q(sql, *args):
    return db().execute(sql, args).fetchall()


def one(sql, *args):
    return db().execute(sql, args).fetchone()


def scalar(sql, *args):
    return next(iter(one(sql, *args).values()))


def utcnow():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")


def save(table, row, id=None):
    row = dict(row)
    if table in AUDITED:
        row["LastModified"] = utcnow()
    if id is None:
        row = {**DEFAULTS.get(table, {}), **row}
        if table in AUDITED:
            row["CreatedDate"] = row["LastModified"]
        sql = f'INSERT INTO "main_{table}" ({",".join(row)}) VALUES ({",".join("?" * len(row))})'
        args = list(row.values())
    else:
        sql = f'UPDATE "main_{table}" SET {",".join(c + "=?" for c in row)} WHERE id=?'
        args = [*row.values(), id]
    db().execute(sql, args)
    db().commit()


def next_code(table, prefix, width):
    last = one(f'SELECT Code FROM "main_{table}" ORDER BY id DESC LIMIT 1')
    n = int(last["Code"].split("-")[-1]) if last and last["Code"] else 0
    return f"{prefix}-{str(n + 1).zfill(width)}"


def body():
    return request.get_json(silent=True) or {}


def role_required(*roles):
    """Staff login required. Admin always passes; others only if listed. Re-checked against DB each request."""
    def wrap(fn):
        @functools.wraps(fn)
        def inner(*args, **kwargs):
            user = one("SELECT UserID, FullName, Role FROM main_myuser WHERE UserID=? AND Active=1 AND Deleted=0",
                       session.get("user_id"))
            if not user:
                session.clear()
                return jsonify({"status": 0, "message": "Login required"}), 401
            if user["Role"] != "admin" and user["Role"] not in roles:
                return jsonify({"status": 0, "message": "Not allowed"}), 403
            g.user = user
            return fn(*args, **kwargs)
        return inner
    return wrap


def public_user(u):
    return {"userid": u["UserID"], "name": u["FullName"], "role": u["Role"]}


def images(code):
    d = os.path.join(MENU_IMAGE_PATH, code or "")
    return [f for f in os.listdir(d) if os.path.isfile(os.path.join(d, f))] if os.path.isdir(d) else []


def local(dt):
    return dt.astimezone(IST) if dt else None


def today():
    return datetime.now(IST).date()


# ---------- Menu ----------

@app.route("/get_category", methods=["GET", "POST"])
def get_category():
    return jsonify(q("SELECT * FROM main_category WHERE Active=1 AND Deleted=0"))


@app.route("/get_category_list", methods=["GET", "POST"])
@role_required()
def get_category_list():
    return jsonify({"status": 1, "data": q("SELECT * FROM main_category WHERE Deleted=0")})


@app.route("/save_category", methods=["POST"])
@role_required()
def save_category():
    data = body()
    code = data.get("code", "")
    row = {"Name": data.get("name", ""), "Active": data.get("active", True)}
    if code:
        save("category", row, scalar("SELECT id FROM main_category WHERE Code=?", code))
    else:
        save("category", {**row, "Code": next_code("category", "CAT", 5)})
    return jsonify({"status": 1, "message": "Category Saved"})


@app.route("/save_menu_item", methods=["POST"])
@role_required()
def save_menu_item():
    data = json.loads(request.form.get("data"))
    code = data.get("code", "")
    name = data.get("name", "")

    if code == "" and one("SELECT id FROM main_menuitem WHERE Name=?", name):
        return jsonify({"status": 400, "message": "Name already exists"})

    row = {
        "Name": name,
        "Available": data.get("available", False),
        "CategoryCode": data.get("category", ""),
        "Description": data.get("description", ""),
        "Price": data.get("price", 0),
        "Tags": ",".join(data.get("tags", [])),
        "PreparationTime": data.get("prepTime", 0),
    }
    existing = one("SELECT id, Code FROM main_menuitem WHERE Code=?", code)
    if existing:
        item_code = existing["Code"]
        save("menuitem", row, existing["id"])
    else:
        item_code = next_code("menuitem", "MIT", 5)
        save("menuitem", {**row, "Code": item_code})

    # Replace images
    folder = os.path.join(MENU_IMAGE_PATH, item_code)
    shutil.rmtree(folder, ignore_errors=True)
    for f in request.files.values():
        os.makedirs(folder, exist_ok=True)
        f.save(os.path.join(folder, secure_filename(f.filename)))

    for o in data.get("optionGroup", []):
        grow = {
            "Name": o.get("title", ""),
            "MaxSelection": o.get("maxSelection", 1),
            "SelectionType": o.get("type", "single"),
            "ItemCode": item_code,
        }
        g_existing = one("SELECT id, Code FROM main_optiongroup WHERE Code=?", o.get("code", ""))
        if g_existing:
            group_code = g_existing["Code"]
            save("optiongroup", grow, g_existing["id"])
        else:
            group_code = next_code("optiongroup", "OPG", 5)
            save("optiongroup", {**grow, "Code": group_code})

        for i in o.get("items", []):
            orow = {"Name": i.get("name", ""), "Price": i.get("price", 0), "GroupCode": group_code}
            o_existing = one("SELECT id FROM main_menuoption WHERE Code=?", i.get("code", ""))
            if o_existing:
                save("menuoption", orow, o_existing["id"])
            else:
                save("menuoption", {**orow, "Code": next_code("menuoption", "MOP", 5)})

    return jsonify({"status": 1})


@app.route("/get_menu_desktop", methods=["GET", "POST"])
@role_required("staff")
def get_menu_desktop():
    menus = q("""SELECT m.*, c.Name AS CategoryName FROM main_menuitem m
                 LEFT JOIN main_category c ON c.Code = m.CategoryCode WHERE m.Deleted=0""")
    for m in menus:
        m["Images"] = images(m["Code"])
    return jsonify(menus)


@app.route("/get_menu_mobile", methods=["GET", "POST"])
def get_menu_mobile():
    menus = q("SELECT * FROM main_menuitem WHERE Available=1 AND Deleted=0")
    for m in menus:
        m["Images"] = images(m["Code"])
    return jsonify(menus)


@app.route("/get_single_menu_item", methods=["POST"])
def get_single_menu_item():
    code = body().get("code", "")
    item = one("SELECT * FROM main_menuitem WHERE Code=?", code)
    if not item:
        return jsonify({"status": 0, "message": "Menu item not found"})
    groups = q("SELECT * FROM main_optiongroup WHERE ItemCode=?", code)
    for og in groups:
        og["Options"] = q("SELECT * FROM main_menuoption WHERE GroupCode=?", og["Code"])
    return jsonify({"status": 1, "data": item, "options": groups, "images": images(code)})


@app.route("/update_menu_item_staus", methods=["POST"])
@role_required()
def update_menu_item_staus():
    data = body()
    item = one("SELECT id FROM main_menuitem WHERE id=?", data.get("id"))
    if not item:
        return jsonify({"status": 0, "message": "Menu item not found"})
    row = {"LastModifiedBy": "admin"}
    if data.get("field", "available") == "available":
        row["Available"] = data.get("status", False)
    elif data.get("field") == "delete":
        row["Deleted"] = True
    save("menuitem", row, item["id"])
    return jsonify({"status": 1, "message": "success"})


# ---------- Orders ----------

@app.route("/save_order", methods=["POST"])
def save_order():
    data = json.loads(request.form.get("data") or "{}")
    tableno = request.form.get("tableno")
    if not one("SELECT id FROM main_table WHERE TableNo=? AND Deleted=0", tableno):
        return jsonify({"status": 0, "message": "Unknown table"})

    # Price everything from the DB; the client only says what and how many.
    lines = []
    for item_code, item in (data.get("items") or {}).items():
        menu = one("SELECT Price FROM main_menuitem WHERE Code=? AND Available=1 AND Deleted=0", item_code)
        if not menu:
            return jsonify({"status": 0, "message": "An item is no longer available"})
        try:
            qty = int(item["info"]["quantity"])
        except (KeyError, TypeError, ValueError):
            qty = 0
        if not 1 <= qty <= 50:
            return jsonify({"status": 0, "message": "Invalid quantity"})
        opts = []
        for group_code, chosen in (item.get("options") or {}).items():
            group = one("SELECT MaxSelection FROM main_optiongroup WHERE Code=? AND ItemCode=? AND Deleted=0",
                        group_code, item_code)
            if not group or len(chosen) > group["MaxSelection"]:
                return jsonify({"status": 0, "message": "Invalid options"})
            for opt_code in chosen:
                opt = one("SELECT Price FROM main_menuoption WHERE Code=? AND GroupCode=? AND Deleted=0",
                          opt_code, group_code)
                if not opt:
                    return jsonify({"status": 0, "message": "Invalid options"})
                opts.append((group_code, opt_code, opt["Price"]))
        lines.append((item_code, menu["Price"], qty, opts))
    if not lines:
        return jsonify({"status": 0, "message": "Cart is empty"})

    last_today = one(f"SELECT ShortCode FROM main_order WHERE {LDATE}=? ORDER BY id DESC LIMIT 1",
                     today().isoformat())
    short = str(int(last_today["ShortCode"]) + 1 if last_today else 1).zfill(4)
    row = {"CustomerId": request.form.get("userid"), "Note": data.get("note", ""), "Status": "P",
           "TableNo": tableno, "PaymentStatus": "L", "ShortCode": short, "OrderTime": utcnow()}
    ms = int(time.time() * 1000)
    while True:  # unique index on Code; bump on same-millisecond collision
        try:
            order_code = f"ORD-{ms}"
            save("order", {**row, "Code": order_code})
            break
        except sqlite3.IntegrityError:
            ms += 1

    for item_code, price, qty, opts in lines:
        db().execute("INSERT INTO main_orderitem (OrderCode, OrderItemCode, Price, Quantity) VALUES (?,?,?,?)",
                     (order_code, item_code, price, qty))
        db().executemany(
            "INSERT INTO main_orderoptions (OrderCode, OrderItemCode, GroupCode, OptionCode, Price) VALUES (?,?,?,?,?)",
            [(order_code, item_code, gc, oc, p) for gc, oc, p in opts])
    db().commit()
    return jsonify({"status": 1, "message": "success", "code": order_code})


def order_detail(order):
    end = order["CompletionTime"] or datetime.now(timezone.utc)
    order["TimeElapsed"] = int((end - order["OrderTime"]).total_seconds() // 60)
    order["Time"] = local(order["OrderTime"]).strftime("%I:%M %p")
    order["OrderTime"] = local(order["OrderTime"]).strftime("%d %b %y %I:%M %p")
    order["CompletionTime"] = local(order["CompletionTime"])
    order["Items"] = []
    for oi in q("SELECT * FROM main_orderitem WHERE OrderCode=?", order["Code"]):
        code = oi["OrderItemCode"]
        order["Items"].append({
            "data": one("SELECT * FROM main_menuitem WHERE Code=?", code) or {},
            "images": images(code),
            "orderitem": oi,
            "addons": q("""SELECT m.* FROM main_orderoptions o JOIN main_menuoption m ON m.Code = o.OptionCode
                           WHERE o.OrderCode=? AND o.OrderItemCode=?""", order["Code"], code),
        })
    order["Reviews"] = q("SELECT * FROM main_review WHERE OrderCode=?", order["Code"])
    return order


@app.route("/get_orders", methods=["POST"])
@role_required("staff", "kitchen")
def get_orders():
    # ponytail: newest 200 only; add paging if staff need older history on this board
    orders = q("SELECT * FROM main_order WHERE Status=? ORDER BY id DESC LIMIT 200", body().get("status", "A"))
    return jsonify({"status": 1, "data": [order_detail(o) for o in orders]})


@app.route("/get_my_orders", methods=["POST"])
def get_my_orders():
    orders = q("SELECT * FROM main_order WHERE CustomerId=? ORDER BY OrderTime DESC", body().get("userid", ""))
    return jsonify({"status": 1, "data": [order_detail(o) for o in orders]})


@app.route("/update_order_status", methods=["POST"])
@role_required("staff", "kitchen")
def update_order_status():
    data = body()
    order = one("SELECT id FROM main_order WHERE Code=?", data.get("code"))
    if not order:
        return jsonify({"status": 0, "message": "Order not found"})
    row = {"Status": data.get("status")}
    if row["Status"] == "S":
        row["CompletionTime"] = utcnow()
    save("order", row, order["id"])
    return jsonify({"status": 1, "message": "Order status updated"})


@app.route("/get_order_status_count", methods=["GET", "POST"])
@role_required("staff", "kitchen")
def get_order_status_count():
    rows = q("SELECT Status, COUNT(*) AS n FROM main_order GROUP BY Status")
    return jsonify({"status": 1, "data": {r["Status"]: r["n"] for r in rows}})


# ---------- Table bills ----------

def open_orders(tableno=None):
    """Unpaid, not-cancelled orders, optionally for one table."""
    sql = f"SELECT * FROM main_order WHERE PaymentStatus NOT IN {PAID} AND Status NOT IN {CANCELLED}"
    if tableno is None:
        return q(sql + " ORDER BY id")
    return q(sql + " AND TableNo=? ORDER BY id", tableno)


def order_amount(code):
    return scalar("""SELECT COALESCE(SUM(oi.Quantity * (oi.Price + COALESCE((SELECT SUM(op.Price) FROM main_orderoptions op
                     WHERE op.OrderCode = oi.OrderCode AND op.OrderItemCode = oi.OrderItemCode), 0))), 0)
                     FROM main_orderitem oi WHERE oi.OrderCode=?""", code)


@app.route("/get_open_tables", methods=["POST"])
@role_required("staff")
def get_open_tables():
    tables = {}
    for o in open_orders():
        t = tables.setdefault(str(o["TableNo"]), {"TableNo": o["TableNo"], "orders": 0, "total": 0})
        t["orders"] += 1
        t["total"] += order_amount(o["Code"])
    return jsonify({"status": 1, "data": sorted(tables.values(), key=lambda t: int(t["TableNo"] or 0))})


@app.route("/get_table_bill", methods=["POST"])
@role_required("staff")
def get_table_bill():
    orders = open_orders(body().get("tableno"))
    total = sum(order_amount(o["Code"]) for o in orders)
    return jsonify({"status": 1, "orders": [order_detail(o) for o in orders], "total": total})


@app.route("/settle_table", methods=["POST"])
@role_required("staff")
def settle_table():
    data = body()
    tableno = data.get("tableno")
    orders = open_orders(tableno)
    if not orders:
        return jsonify({"status": 0, "message": "No unpaid orders for this table"})
    amounts = {o["Code"]: order_amount(o["Code"]) for o in orders}
    total = sum(amounts.values())
    discount = min(max(float(data.get("discount") or 0), 0), total)
    for o in orders:
        # split the discount pro rata so per-order (and per-day) revenue stays right
        share = round(discount * amounts[o["Code"]] / total, 2) if total else 0
        save("order", {"PaymentStatus": "P", "Discount": share}, o["id"])
    db().execute("UPDATE main_servicerequest SET Status='D' WHERE TableNo=? AND Type='bill' AND Status='O'",
                 (str(tableno),))
    db().commit()
    return jsonify({"status": 1, "message": "Table settled", "net": total - discount})


# ---------- Waiter calls / bill requests ----------

@app.route("/service_request", methods=["POST"])
def service_request():
    data = body()
    tableno, kind = str(data.get("tableno") or ""), data.get("type")
    if kind not in ("waiter", "bill") or not one("SELECT id FROM main_table WHERE TableNo=? AND Deleted=0", tableno):
        return jsonify({"status": 0, "message": "Invalid request"})
    if not one("SELECT id FROM main_servicerequest WHERE TableNo=? AND Type=? AND Status='O'", tableno, kind):
        db().execute("INSERT INTO main_servicerequest (TableNo, Type, CustomerId, CreatedAt) VALUES (?,?,?,?)",
                     (tableno, kind, data.get("userid"), utcnow()))
        db().commit()
    return jsonify({"status": 1, "message": "Staff notified"})


@app.route("/get_service_requests", methods=["POST"])
@role_required("staff")
def get_service_requests():
    rows = q("SELECT * FROM main_servicerequest WHERE Status='O' ORDER BY id")
    now = datetime.now(timezone.utc)
    for r in rows:
        r["Minutes"] = int((now - r["CreatedAt"]).total_seconds() // 60)
    return jsonify({"status": 1, "data": rows})


@app.route("/resolve_service_request", methods=["POST"])
@role_required("staff")
def resolve_service_request():
    db().execute("UPDATE main_servicerequest SET Status='D' WHERE id=?", (body().get("id"),))
    db().commit()
    return jsonify({"status": 1})


@app.route("/submit_review", methods=["POST"])
def submit_review():
    data = body()
    save("review", {"OrderCode": data.get("ordercode", ""), "Remark": data.get("remark", ""),
                    "Star": data.get("star", "")})
    return jsonify({"status": 1})


@app.route("/get_review_list", methods=["GET", "POST"])
@role_required()
def get_review_list():
    reviews = q("SELECT r.*, o.OrderTime FROM main_review r LEFT JOIN main_order o ON o.Code = r.OrderCode")
    for r in reviews:
        if r["OrderTime"]:
            r["OrderTime"] = local(r["OrderTime"]).strftime("%d %b %y %I:%M %p")
        else:
            del r["OrderTime"]
    return jsonify({"stauts": 1, "data": reviews})


# ---------- Tables / settings / users ----------

@app.route("/save_table", methods=["POST"])
@role_required()
def save_table():
    tableno = body().get("tableno", "")
    if one("SELECT id FROM main_table WHERE TableNo=? AND Deleted=0", tableno):
        return jsonify({"status": 2, "message": "Table no already exists"})
    save("table", {"TableNo": tableno})
    return jsonify({"status": 1, "message": "Table created"})


@app.route("/delete_table", methods=["POST"])
@role_required()
def delete_table():
    t = one("SELECT id FROM main_table WHERE TableNo=?", body().get("tableno", ""))
    if t:
        save("table", {"Deleted": True}, t["id"])
    return jsonify({"status": 1, "message": "Table Deleted"})


@app.route("/get_table_list", methods=["GET", "POST"])
@role_required("staff")
def get_table_list():
    return jsonify({"data": q("SELECT * FROM main_table WHERE Deleted=0 ORDER BY TableNo")})


@app.route("/save_user", methods=["POST"])
@role_required()
def save_user():
    data = body()
    userid = data.get("userid", "")
    row = {"UserID": userid, "FullName": data.get("name", ""), "Password": data.get("password", ""),
           "Active": data.get("active", "") == "1", "Role": data.get("role", "staff")}
    if row["Role"] not in ROLES:
        return jsonify({"status": 0, "message": "Invalid role"})
    if userid == g.user["UserID"] and (row["Role"] != "admin" or not row["Active"]):
        return jsonify({"status": 0, "message": "You cannot remove your own admin access"})
    existing = one("SELECT id FROM main_myuser WHERE UserID=? AND Deleted=0", userid)
    save("myuser", row, existing["id"] if existing else None)
    return jsonify({"status": 1, "message": "User Saved"})


@app.route("/get_user_list", methods=["GET", "POST"])
@role_required()
def get_user_list():
    return jsonify({"status": 1, "users": q("SELECT * FROM main_myuser WHERE Deleted=0")})


@app.route("/get_user_detail", methods=["POST"])
@role_required()
def get_user_detail():
    user = one("SELECT * FROM main_myuser WHERE UserID=?", body().get("userid", ""))
    if not user:
        return jsonify({"status": 0, "message": "User not found"})
    return jsonify({"status": 1, "detail": user})


# ---------- Auth ----------

@app.route("/login_user", methods=["POST"])
def login_user():
    data = body()
    # ponytail: plaintext password compare, same as the Django version. Hash when users matter.
    user = one("SELECT * FROM main_myuser WHERE UserID=? AND Password=? AND Active=1 AND Deleted=0",
               data.get("userid"), data.get("password"))
    if not user:
        return jsonify({"status": 0, "message": "Invalid credentials"})
    session["user_id"] = user["UserID"]
    return jsonify({"status": 1, "message": "Login successful", "user": public_user(user)})


@app.route("/logout_user", methods=["GET", "POST"])
def logout_user():
    session.clear()
    return jsonify({"status": 1, "message": "Logged out"})


@app.route("/check_login_status", methods=["GET", "POST"])
def check_login_status():
    user = one("SELECT * FROM main_myuser WHERE UserID=? AND Active=1 AND Deleted=0", session.get("user_id"))
    if not user:
        return jsonify({"status": 1, "isLoggedIn": False})
    return jsonify({"status": 1, "isLoggedIn": True, "user": public_user(user)})


# ---------- Dashboard ----------

def stats(start, end, hour=None):
    cond, args = f"{LDATE} BETWEEN ? AND ? AND Status NOT IN {CANCELLED}", [start.isoformat(), end.isoformat()]
    if hour is not None:
        cond, args = cond + f" AND {LHOUR}=?", args + [hour]
    o = one(f"""SELECT COUNT(*) AS orders, COUNT(DISTINCT CustomerId) AS customers,
                       COALESCE(SUM(Discount), 0) AS discount FROM main_order WHERE {cond}""", *args)
    i = one(f"""SELECT COALESCE(SUM(oi.Quantity), 0) AS items,
                       COALESCE(SUM(oi.Quantity * (oi.Price + COALESCE((SELECT SUM(op.Price) FROM main_orderoptions op
                           WHERE op.OrderCode = oi.OrderCode AND op.OrderItemCode = oi.OrderItemCode), 0))), 0) AS revenue
                FROM main_orderitem oi WHERE oi.OrderCode IN (SELECT Code FROM main_order WHERE {cond})""", *args)
    return {"orders": o["orders"], "customers": o["customers"], "items": i["items"],
            "revenue": round(i["revenue"] - o["discount"], 2)}


def change(curr, prev):
    if prev == 0:
        return 100 if curr > 0 else 0
    return round((curr - prev) / prev * 100)


def hour_label(h):
    return "12AM" if h == 0 else f"{h}AM" if h < 12 else "12PM" if h == 12 else f"{h - 12}PM"


@app.route("/get_dashboard_stats", methods=["POST"])
@role_required()
def get_dashboard_stats():
    period = body().get("period", "daily")
    t = today()

    if period == "daily":
        start, prev_start = t, t - timedelta(days=1)
        prev_end = prev_start
    elif period == "last_30_days":
        start, prev_start, prev_end = t - timedelta(days=29), t - timedelta(days=59), t - timedelta(days=30)
    elif period == "yearly":
        start = (t.replace(day=1) - timedelta(days=330)).replace(day=1)
        prev_start, prev_end = (start - timedelta(days=365)).replace(day=1), start - timedelta(days=1)
    else:  # monthly, compared to the same day-count of the previous month
        start = t.replace(day=1)
        prev_month_end = start - timedelta(days=1)
        prev_start = prev_month_end.replace(day=1)
        prev_end = prev_start.replace(day=min(t.day, prev_month_end.day))

    cur, prev = stats(start, t), stats(prev_start, prev_end)
    summary = {}
    for k in ("items", "orders", "customers", "revenue"):
        summary[k], summary[k + "_change"] = cur[k], change(cur[k], prev[k])

    buckets = []  # (label, stats)
    if period == "daily":
        buckets = [(hour_label(h), stats(t, t, h)) for h in range(24)]
    elif period == "yearly":
        for i in range(12):
            m_start = (start + timedelta(days=i * 31)).replace(day=1)
            m_end = min((m_start + timedelta(days=32)).replace(day=1) - timedelta(days=1), t)
            buckets.append((m_start.strftime("%b"), stats(m_start, m_end)))
    else:
        for i in range((t - start).days + 1):
            d = start + timedelta(days=i)
            buckets.append((d.strftime("%d %b") if period == "last_30_days" else str(d.day), stats(d, d)))

    return jsonify({"status": 1, "summary": summary, "charts": {
        "labels": [b[0] for b in buckets],
        "items": [b[1]["items"] for b in buckets],
        "orders": [b[1]["orders"] for b in buckets],
        "customers": [b[1]["customers"] for b in buckets],
        "revenue": [b[1]["revenue"] for b in buckets],
        "expenses": [0] * len(buckets),
    }})


def customers(cond, *args):
    return scalar(f"SELECT COUNT(DISTINCT CustomerId) FROM main_order WHERE {cond}", *args)


def avg_customers(cond, *args):
    """Average distinct customers per day over the days matching cond."""
    total = scalar(f"SELECT COUNT(*) FROM (SELECT DISTINCT {LDATE}, CustomerId FROM main_order WHERE {cond})", *args)
    days = scalar(f"SELECT COUNT(DISTINCT {LDATE}) FROM main_order WHERE {cond}", *args) or 1
    return round(total / days, 1)


@app.route("/get_customer_map_stats", methods=["POST"])
@role_required()
def get_customer_map_stats():
    period = body().get("period", "daily")
    t = today()

    if period == "daily":
        labels = [hour_label(h) for h in range(24)]
        current = [customers(f"{LDATE}=? AND {LHOUR}=?", t.isoformat(), h) for h in range(24)]
        # Django version divided by the total count of past days, not per-hour days
        past_days = scalar(f"SELECT COUNT(DISTINCT {LDATE}) FROM main_order WHERE {LDATE}<?", t.isoformat()) or 1
        average = [round(scalar(f"SELECT COUNT(*) FROM (SELECT DISTINCT {LDATE}, CustomerId FROM main_order "
                                f"WHERE {LDATE}<? AND {LHOUR}=?)", t.isoformat(), h) / past_days, 1)
                   for h in range(24)]
    elif period == "weekly":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        week_start = (t - timedelta(days=t.weekday())).isoformat()
        wd = f"CAST(strftime('%w', OrderTime, {LOCAL}) AS INTEGER)"  # Sun=0
        current = [customers(f"{LDATE} BETWEEN ? AND ? AND {wd}=?", week_start, t.isoformat(), (d + 1) % 7)
                   for d in range(7)]
        average = [avg_customers(f"{LDATE}<? AND {wd}=?", week_start, (d + 1) % 7) for d in range(7)]
    else:  # monthly, rolling 30 days
        start = t - timedelta(days=29)
        days = [start + timedelta(days=i) for i in range(30)]
        labels = [str(d.day) for d in days]
        current = [customers(f"{LDATE}=?", d.isoformat()) for d in days]
        dom = f"CAST(strftime('%d', OrderTime, {LOCAL}) AS INTEGER)"
        average = [avg_customers(f"{LDATE}<? AND {dom}=?", start.isoformat(), d.day) for d in days]

    return jsonify({"status": 1, "labels": labels, "current": current, "average": average})


# ---------- Static ----------

@app.route("/menuImages/<path:filename>")
def menu_image(filename):
    return send_from_directory(MENU_IMAGE_PATH, filename)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def react(path):
    if path and os.path.isfile(os.path.join(BUILD_DIR, path)):
        return send_from_directory(BUILD_DIR, path)
    return send_from_directory(BUILD_DIR, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
