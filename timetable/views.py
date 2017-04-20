from django.shortcuts import render, get_object_or_404
# Create your views here.
import re
from django.db.models import Q
from .models import Classitem
from .forms import SearchForm
from .switcher import switch_to_gradename
from django.http import HttpResponse


def index(request):
    # render filtered table
    if request.method == 'POST':

        form = SearchForm(request.POST)
        vals = {'checkbox':'', 'dropdown':''}
        vals['checkbox'] = request.POST.getlist('grade')
        vals['dropdown'] = request.POST['dept']

        if form.is_valid():
            dept = request.POST['dept']
            if request.POST.getlist('grade') != []:
                grades = request.POST.getlist('grade')
                results = Classitem.objects.filter(dept=dept)
                lis=[]
                for x in grades:
                    lis.append(switch_to_gradename(x))
                results = Classitem.objects.filter(dept=dept).filter(grade__in=lis)
            else:
                results = Classitem.objects.filter(dept=dept)

            return render(request, "timetable/index.html", {"items" : results, "vals" : vals})

    else:
        # GET method
        return render(request, "timetable/index.html", {})
