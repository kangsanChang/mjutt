from django.shortcuts import render, get_object_or_404
# Create your views here.
from .models import Classitem
from .switcher import all_dept
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.db.models import Q # for search with partial words

def index(request):
    # render filtered table
    if request.method == 'POST':
        if request.is_ajax():
            dept = request.POST.get('dept')
            grades = request.POST.getlist('grade[]')
            searchtext = request.POST['searchtext']

            results = Classitem.objects

            if dept != "":
                results = results.filter(dept=dept)

            if grades != []:
                results = results.filter(grade__in=grades)

            if(searchtext != ''):
                results = results.filter(Q(classname__icontains=searchtext) | Q(prof__icontains=searchtext))

            if(results == []):
                #학과나 검색어중 하나도 없는 경우(아무것도 없거나 학년만 체크) -> 에러처리
                print("dept is empty")
                return HttpResponse({"error_message":"입력 조건이 더 필요합니다"})

            data = serializers.serialize('json',results) # query set to json
            return JsonResponse(data, safe=False) # dictionary 아닌 type을 보내려면 false

        else:
            print("not ajax call")
    else:
        # GET method
        depts = all_dept() # ordered dictionary
        all_grade = ["전학년","1학년","2학년","3학년","4학년"]
        days = ["Mon","Tue","Wed","Thu","Fri","Sat"] # 시간표 thead 에는 filter 거쳐서 한글로 들어가고 value 자체는 cell의 class 값으로 씀
        hours = ["09","10","11","12","13","14","15","16","17","18","19","20"]
        minutes = ["00","30"]
        return render(request, "timetable/index.html", {"depts":depts , "all_grade":all_grade , "hours":hours, "minutes":minutes ,"days":days})
        # dictionary를 주고 tempalte 에서 .items 키워드를 이용하면 key와 value로 쪼갤 수 있음
