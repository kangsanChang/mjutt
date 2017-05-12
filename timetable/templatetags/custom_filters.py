from django import template

register = template.Library()

@register.filter
def start_time(l, key):
    return l[key]

@register.filter
def end_time(l,key):
    value = int(l[key])+1;
    return value
# nested forloop 에서 바깥 iterator를 가지고 list에 접근하기 위함

@register.filter
def korean_day(l,key):
    value=l[key]
    return{
        "Mon" : "월요일",
        "Tue" : "화요일",
        "Wed" : "수요일",
        "Thu" : "목요일",
        "Fri" : "금요일",
    }.get(value,' ')
