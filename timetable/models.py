from django.db import models

# Create your models here.

class Classitem(models.Model):
    grade = models.CharField(max_length=10, blank=True, null=True)
    classname = models.CharField(max_length=50, blank=True, null=True)
    krcode = models.CharField(max_length=10, blank=True, null=True)
    credit = models.CharField(max_length=5, blank=True, null=True)
    timeperweek = models.CharField(max_length=5, blank=True, null=True)
    prof = models.CharField(max_length=30, blank=True, null=True)
    classcode = models.CharField(max_length=10, blank=True, null=True)
    limitstud = models.CharField(max_length=10, blank=True, null=True)
    time = models.CharField(max_length=200, blank=True, null=True)
    note = models.CharField(max_length=200, blank=True, null=True)
    dept = models.CharField(max_length=100, blank=True, null=True)
    class Meta:
        managed = False
        db_table = 'classitem'


    def __str__(self):
        return self.dept + " / " + self.classname + " / " + self.prof +  " / " + self.classcode
