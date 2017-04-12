from django.shortcuts import render, get_object_or_404
# Create your views here.
import re
from django.db.models import Q
from .models import Classitem
from .forms import ClassitemForm
from django.http import HttpResponse

def index(request):
    items = Classitem.objects.all()
    return render(request, "timetable/index.html", {"items" : items})
