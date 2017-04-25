from django.shortcuts import render, get_object_or_404, render_to_response
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
    # if request.is_ajax():
    # form = SearchForm(request.POST)
    # vals = {'checkbox':'', 'dropdown':'', 'classname':''}
    # vals['checkbox'] = request.POST.getlist('grade')
    # vals['dropdown'] = request.POST['dept']
    # vals['classname'] = request.POST['classname']
    # if form.is_valid():
    #     dept = request.POST['dept']
    #     if request.POST.getlist('grade') != []:
    #         grades = request.POST.getlist('grade')
    #         results = Classitem.objects.filter(dept=dept)
    #         lis=[]
    #         for x in grades:
    #             lis.append(switch_to_gradename(x))
    #         results = Classitem.objects.filter(dept=dept).filter(grade__in=lis)
    #     else:
    #         results = Classitem.objects.filter(dept=dept)
    #
    #     return render(request, "timetable/index.html", {"items" : results, "vals" : vals})


        if request.is_ajax():
            print("dept: ")
            dept = request.POST.get('dept')
            print(dept)
            print("grade: ")
            grades = request.POST.getlist('grade[]')
            print(grades)
            classname = request.POST['classname']
            print("Classname:")
            print(classname)
            print(request.POST.get('csrfmiddlewaretoken'))


            if dept != "":

                if grades != []:
                    # db에서 찾기 위해 학년 코드를 이름으로 변경 "n학년"
                    grade_list=[]
                    for x in grades:
                        grade_list.append(switch_to_gradename(x))

                    if classname != '':
                        #학과, 학년, 과목이름이 있는 경우
                        print("class name not empty")

                    else:
                        # 학과랑, 학년만 있는 경우
                        results = Classitem.objects.filter(dept=dept).filter(grade__in=grade_list)

                elif classname != '' :
                    # 학과랑 과목이름이 있는 경우
                    # 과목이름 검색 필요
                    print('hello')
                else:
                    # 학과만 있는 경우
                    results = Classitem.objects.filter(dept=dept)
            else:
                #학과도 없는 경우 -> 에러처리
                print("dept is empty")

            print(results)
            return render_to_response("timetable/index.html",{"items":results})


        else:
            print("not ajax")
    else:
        # GET method
        return render(request, "timetable/index.html", {})
