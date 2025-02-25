from django.db import models

# Create your models here.

class Category(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Active = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class MenuItem(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Image = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Description = models.TextField(default=None)
  Tags = models.TextField(default=None, null = True, blank = True)
  PreparationTime = models.PositiveIntegerField(default=0)
  CategoryCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Price = models.FloatField(default=0.0)
  Available = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class MenuOption(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  Price = models.FloatField(default=0)
  GroupCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Active = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class OptionGroup(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  ItemCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Name = models.CharField(max_length = 200, default=None, null = True, blank = True)
  SelectionType = models.CharField(max_length = 20, default=None, null = True, blank = True)
  MaxSelection = models.PositiveIntegerField(default = 1)
  Active = models.BooleanField(default = True)
  Deleted = models.BooleanField(default = False)
  CreatedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  CreatedDate = models.DateTimeField(auto_now_add = True)
  LastModifiedBy = models.CharField(max_length = 200, default=None, null = True, blank = True)
  LastModified = models.DateTimeField(auto_now = True)

class Order(models.Model):
  Code = models.CharField(max_length = 20, default=None, null = True, blank = True)
  ShortCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  CustomerId = models.CharField(max_length = 100, default=None, null = True, blank = True)
  TableNo = models.PositiveIntegerField(default = 0, null = True, blank = True)
  Note = models.TextField(default=None, null = True, blank = True)
  Status = models.CharField(max_length = 10, default=None, null = True, blank = True) # Status Codes P = Pending, A = Accepted, R = Ready, S = Served
  PaymentStatus = models.CharField(max_length = 10, default=None, null = True, blank = True) # Payment Status L = Pay Later, P = Paid, R = Received
  OrderTime = models.DateTimeField(auto_now_add = True)

class OrderItem(models.Model):
  OrderCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  OrderItemCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Price = models.FloatField(default = 0)
  Quantity = models.PositiveIntegerField(default = 1)

class OrderOptions(models.Model):
  OrderCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  OrderItemCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  GroupCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  OptionCode = models.CharField(max_length = 20, default=None, null = True, blank = True)
  Price = models.FloatField(default = 0)