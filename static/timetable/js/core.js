//Global Variable

used_colors = [];
class_items = [];
class_elems = []; // resize 시 elem의 포지션을 한번에 조정하기 위함

function random_pop(arr){
  rand_idx = Math.floor(Math.random() * arr.length);
  return arr.splice(rand_idx, 1)[0]; //object 로 리턴하기 떄문에 0으로 접근
}

function target_pop(arr, t){
  target_idx = arr.indexOf(t);
  return arr.splice(target_idx, 1)[0]; //object 로 리턴하기 떄문에 0으로 접근
}

function check_insert(){
  if(confirm("추가하시겠습니까?")){
    insert_classitem($(".clicked"));
  }else{
    return;
  }
}
// day는 classtime에서 파싱해서 가져온 한글을 code로 바꿔줌
function day_to_code(day){
  switch (day){
    case '월' : ret = 'Mon'; break;
    case '화' : ret = 'Tue'; break;
    case '수' : ret = 'Wed'; break;
    case '목' : ret = 'Thu'; break;
    case '금' : ret = 'Fri'; break;
  }
  return ret;
}

function get_random_item_color(){
  colors=["ec555a","c65353","ffccce","f56e3d","f8d56d","cfe19d","34a26b","28bdbd","4280d7","e39dfb"];
  $.each(used_colors, function(i,val){
    target_pop(colors, val);
  });
  extracted_color = random_pop(colors);
  used_colors.push(extracted_color);
  return extracted_color;
}

function time_parser(elem){
  var row_dict = {};
  // element는 clicked 인 row이므로 무조건 1개라서 0으로 접근
  classname = $(elem)[0].children[1].innerHTML;
  prof = $(elem)[0].children[4].innerHTML;
  credit = $(elem)[0].children[2].innerHTML;
  classtime = $(elem)[0].children[7].innerHTML.split(","); //["월13:00-14:50 (Y5420)", "수13:00-14:50 (Y5420)"]
  classcode = $(elem)[0].children[5].innerText; // innerHTML은 trim이 안됨
  daypattern = /(월|화|수|목|금)/;
  timepattern = /\d{2}:\d{2}/g;
  classroompattern = /\w\d{3,5}/g;

  days = [];
  times=[];
  classrooms=[];

  // except empty
  $.each(classtime, function(index, value){
    if(value=="미입력"){
      days.push("empty");
      times.push("empty");
      classrooms.push("empty");
    }else{
      day= value.match(daypattern);
      time = value.match(timepattern);
      classroom = value.match(classroompattern);
      days.push(day[0]); // push() method : new value to array, append()는 html에 추가할때 사용, day가 array라서 index붙임
      times.push(time);
      if(classroom === null){
        classrooms.push("empty");
      }else{
        classrooms.push(classroom[0]);
      }
    }
  });

  // dict 접근법 2가지 dict['abc'] , dict.abc (linter에서는 dot notation을 쓰라함)

  row_dict.classname = classname;
  row_dict.prof = prof;
  row_dict.credit = credit;
  row_dict.classtime = classtime;
  row_dict.days = days;
  row_dict.times = times;
  row_dict.classrooms = classrooms;
  row_dict.classcode = classcode;

  return row_dict;
}

function ClassItem(item){
  this.classname = item.classname;
  this.prof = item.prof;
  this.credit = item.credit;
  this.classtime = item.classtime; // array
  this.classcode = item.classcode;
}

function ClassElement(item, i){
  // 한 엘리먼트 값임! 한 강의엔 여러 엘리먼트(월,수 수업일 경우 : 2개)가 있음
  // property
  this.classname = item.classname;
  this.prof = item.prof;
  this.classcode = item.classcode;
  this.classroom = item.classrooms[i];
  this.credit = item.credit;
  this.day = day_to_code(item.days[i]); // 월 -> Mon
  this.shour = item.times[i][0].split(":")[0]; // start hour
  this.smin = item.times[i][0].split(":")[1]; // start min
  this.ehour = item.times[i][1].split(":")[0]; // end hour
  this.emin = item.times[i][1].split(":")[1]; // end min
  this.interval_minute = (parseInt(this.ehour) - parseInt(this.shour))*60 + (parseInt(this.emin) - parseInt(this.smin));
  this.elem_top = "";
  this.elem_left = "";
  this.elem_width = "";
  this.elem_height = "";
  this.elem_color = "";

  this.getItemCode = function(){
    return "."+this.classcode;
  };
}

// method
ClassElement.prototype.create_html= function(){
  html = '<div class="classitem wait '+this.classcode+' '+this.day+this.shour+'"><div class="content">\
  <strong>'+this.classname+'</strong><br>'+this.prof+'<br>'+this.classroom+'<br></div></div>';

  $(".classitems").append(html);

  // 현재 선택한 학점. (ClassItem 객체 이용)
  $("#total_credit").empty();
  $("#total_credit").append(total_credit());
};

ClassElement.prototype.setPosition = function(option){
  this.elem_width = $("."+this.shour).filter("."+this.day).width();  // cell 한개 너비가 곧 elem의 너비
  cell_height = $("."+this.shour).filter("."+this.day).height();  // cell 한 개 높이
  this.elem_height = Math.round(cell_height * (this.interval_minute/60));

  // top position정하기, start hour와 min에 영향을 받는다
  if(this.smin=="00"){
    this.elem_top = $("."+this.shour).filter("."+this.day).offset().top +1;
  }else{
    // smin이 있을때 top 위치 내려와야 함
    this.elem_top = $("."+this.shour).filter("."+this.day).offset().top +1;
    smin_height = Math.round(cell_height *(this.smin/60));
    item_top += smin_height;
    // 10:30 시작이면 10시보다 한시간 cell의 1/2 높이만큼 멀어짐(top++)
  }
  this.elem_left = $("."+this.shour).filter("."+this.day).offset().left+ 1.5;

  if(option==="create"){
    var el = $(this.getItemCode()+".wait.classitem").width(this.elem_width).height(this.elem_height).offset({top:this.elem_top ,left:this.elem_left});
    el.addClass("classitem_color_"+this.elem_color);
    el.removeClass("wait");
  }else if(option==="resize"){
    // resize case
    // .classitem만 찍으면 element 2개가 둘다 같은 포지션으로 감
    // 객체의 내용과 일치하는 html을 찾기위해 classitem으로 하면 월, 수 이런식으로 나오니 day와 shour로 이루어진 filter 하나 더 거름
    $(this.getItemCode()+".classitem").filter("."+this.day+this.shour).width(this.elem_width).height(this.elem_height).offset({top:this.elem_top ,left:this.elem_left});
  }else{
    // hover case
    var hover_el = $(this.getItemCode()+".wait.classitem").width(this.elem_width).height(this.elem_height).offset({top:this.elem_top ,left:this.elem_left});
    hover_el.addClass("hover");
    hover_el.removeClass("wait");
    // class가 hover classitem 인 tag를 찾으면 됨

  }

};
function hover_classitem(elem){
  row = time_parser(elem);
  for(i=0 ; i< row.classtime.length ; i++){
    el = new ClassElement(row,i); // elem 객체 생성
    el.create_html();
    el.setPosition(); // parameter 없으면 hover case로 실행
  }
}

function insert_classitem(elem){
  row = time_parser(elem);
  class_items.push(new ClassItem(row)); // 내 수업이 담긴 class_items 배열에 추가
  bg_color = get_random_item_color();

  for(i=0 ; i< row.classtime.length ; i++){
    el = new ClassElement(row,i); // elem 객체 생성
    el.elem_color = bg_color;
    class_elems.push(el); // elems 에 넣음
    el.create_html();
    el.setPosition("create");
  }

  //remove hover
  elem.removeClass("hover");
  $("td").removeClass("hover");
}

function total_credit(){
  result = 0;
  $.each(class_items, function(i, val){
	result+=parseInt(val.credit);
  });
  return result;
}

// 이미 있는데 또 추가하려고 하는 경우
function check_exist(){

}

function resize_classitem(){
  // elements와 $(".classitem")의 차이점은 elements 는 object가 있는 배열이고 , $()는 현재 시간표위에 있는 div 가져온거임.
  // selector로도 object를 가져오지만, classElemenet object가 아니어서 아무 정보가 없어서 셋팅 불가능
  $.each(class_elems, function(i, val){
    val.setPosition("resize");
  });
}

function remove_classitem(op, target){

}

function activateCSS(){
  $('#table-body .table-row').hover(function(){
    $(this).addClass("hover");
    hover_classitem($(this));
  }, function(){
    $(this).removeClass("hover");
    $(".classitem.hover").remove(); // hover item 삭제
  });

  $('#table-body .table-row').click(function(event){
    $('.table-row').not(this).removeClass('clicked');
    $('#check *').remove();
    $(this).toggleClass("clicked");

    // clicked 인 경우 add/delete icon 추가
    // clicked 가 없어진 경우 (toggle) icon 삭제
    if($(this).hasClass("clicked")){
      $(this).children('#check').append($('<button class="ui icon button" \
      onclick="check_insert()"><i class="large green checkmark icon">\
      </i></button>'));
    }else{
      $('#check *').remove();
    }
  });
}
