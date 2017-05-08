from django.shortcuts import render, get_object_or_404
# Create your views here.
from .models import Classitem
from .switcher import switch_to_gradename
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
        return render(request, "timetable/index.html", {})
