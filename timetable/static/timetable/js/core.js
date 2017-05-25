//Global Variable

// elements와 $(".classitem")의 차이점은 elements 는 object가 있는 배열이고 , $()는 현재 시간표위에 있는 div 가져온거임.
// selector로도 object를 가져오지만, classElemenet object가 아니어서 element 세부 정보가 없어서 셋팅 불가능
// 그래서 선택한 object 가 담긴 배열 필요
used_colors = [];
class_items = [];
class_elems = [];
full_colors = ["ec555a","c65353","ffccce","f56e3d","f8d56d","cfe19d","34a26b","28bdbd","4280d7","e39dfb"];

// 재사용 함수들
function random_pop(arr){
  rand_idx = Math.floor(Math.random() * arr.length);
  return arr.splice(rand_idx, 1)[0]; //object 로 리턴하기 떄문에 0으로 접근
}

function target_pop(arr, t){
  target_idx = arr.indexOf(t);
  return arr.splice(target_idx, 1)[0]; //object 로 리턴하기 떄문에 0으로 접근
}

function get_matched_color_in_arr(code){
  //return matched object's color in class_elems
  // class_item에는 color는 모르니까 같은 classcode로 elem 조회해서 해당 color 얻어냄
  $.each(class_elems, function(i, val){
   if(val.classcode === code){
     ret = val.elem_color;
     return false; // for breaking each loop
   }
 });
 return ret;
}

function get_matched_object_in_arr(arr, code){
  // param과 동일한 classcode를 가진 object 찾아서 return
  // 일치하는 것을 찾으면 바로 break 후 리턴하므로, 사실상 하나만 return 하므로 class_items에만 써야함.
  $.each(arr, function(i, val){
   if(val.classcode === code){
     ret = val;
     return false; // for breaking each loop
   }
 });
 return ret;
}

function get_matched_prop_removed_array(arr, target_code){
  // slice 와는 다름! 이건 object 들이 있는 array에서 object 안의 property와 같은게 있을 경우 제거하고 나머지를 리턴
  ret = [];
  ret = arr.filter(function(obj){
    return obj.classcode !== target_code;
  });
  // object.classcode과 target_code가 일치하는 것을 제외하고 모아서 만든 배열 : ret
  return ret;
}

function check_same_value_in_array(arr, val, key) {
  // arr[key]의 값과 내가 준 val 과 같으면 true 없으면 false
  return arr.some(arrVal => val[key] === arrVal[key]);
}

function day_to_code(day){
  // classtime에서 파싱해서 가져온 한글을 code로 바꿔줌
  switch (day){
    case '월' : ret = 'Mon'; break;
    case '화' : ret = 'Tue'; break;
    case '수' : ret = 'Wed'; break;
    case '목' : ret = 'Thu'; break;
    case '금' : ret = 'Fri'; break;
  }
  return ret;
}

function prop_to_kor(p){
  // classtime에서 파싱해서 가져온 한글을 code로 바꿔줌
  switch (p){
    case 'grade' : ret = '학년'; break;
    case 'classname' : ret = '교과목명'; break;
    case 'credit' : ret = '학점'; break;
    case 'timeperweek' : ret = '시간'; break;
    case 'prof' : ret = '담당교수'; break;
    case 'classcode' : ret = '강좌번호'; break;
    case 'limit' : ret = '제한인원'; break;
    case 'classtime' : ret = '시간(강의실)'; break;
    case 'note' : ret = '비고'; break;
  }
  return ret;
}

function get_random_item_color(){
  colors = full_colors.slice();
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
  row_dict.grade = $(elem)[0].children[0].innerHTML;
  row_dict.classname = $(elem)[0].children[1].innerHTML;
  row_dict.credit = $(elem)[0].children[2].innerHTML;
  row_dict.timeperweek = $(elem)[0].children[3].innerHTML;
  row_dict.prof = $(elem)[0].children[4].innerHTML;
  row_dict.classcode = $(elem)[0].children[5].innerText; // innerHTML은 trim이 안됨
  row_dict.limit = $(elem)[0].children[6].innerHTML;
  row_dict.classtime = $(elem)[0].children[7].innerHTML.split(","); //["월13:00-14:50 (Y5420)", "수13:00-14:50 (Y5420)"]
  row_dict.note = $(elem)[0].children[8].innerHTML;


  daypattern = /(월|화|수|목|금)/;
  timepattern = /\d{2}:\d{2}/g;
  classroompattern = /\w\d{3,5}/g;

  days = [];
  times=[];
  classrooms=[];

  $.each(row_dict.classtime, function(index, value){
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
  row_dict.days = days;
  row_dict.times = times;
  row_dict.classrooms = classrooms;

  return row_dict;
}

// Define Custom objects
function ClassItem(item){
  this.grade = item.grade;
  this.classname = item.classname;
  this.credit = item.credit;
  this.timeperweek = item.timeperweek;
  this.prof = item.prof;
  this.classcode = item.classcode;
  this.limit = item.limit;
  this.classtime = item.classtime; // array
  this.note = item.note;
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
  this.pos_top = "";
  this.pos_left = "";
  this.elem_width = "";
  this.elem_height = "";
  this.elem_color = "";

  this.getItemCode = function(){
    return "."+this.classcode;
  };
}

// ClassElement Object's method
ClassElement.prototype.create_html= function(){
  html = '<div class="classitem wait '+this.classcode+' '+this.day+this.shour+'" id="'+this.classcode+'"><div class="content">\
  <p><strong>'+this.classname+'</strong><br>'+this.prof+'<br>'+this.classroom+'</p></div></div>';

  $(".classitems").append(html);

  // 현재 선택한 학점. (ClassItem 객체 이용)
  update_total_credit();
};

ClassElement.prototype.setPosition = function(option){
  //elem의 position (top, left, width, height) 설정
  this.elem_width = $("."+this.shour).filter("."+this.day).width();  // cell 한개 너비가 곧 elem의 너비
  cell_height = $("."+this.shour).filter("."+this.day).height();  // cell 한 개 높이
  this.elem_height = Math.round(cell_height * (this.interval_minute/60));

  // top position정하기, time table의 cell의 위치 기준으로 start hour로 기본 위치를 정하고 min에 따라 vertical 로 이동한다.
  this.pos_top = Math.round($("."+this.shour).filter("."+this.day).offset().top +1);
  if(this.smin!="00"){
    // smin이 있을때 top 위치 내려와야 함
    // this.pos_top = $("."+this.shour).filter("."+this.day).offset().top +1;
    smin_height = Math.round(cell_height *(this.smin/60));
    this.pos_top += smin_height;
    // 10:30 시작이면 10시보다 한시간 cell의 1/2 높이만큼 멀어짐(top++)
  }
  this.pos_left = Math.round($("."+this.shour).filter("."+this.day).offset().left+ 2);

  // 옵션에 따른 행동
  // overlapping check하는 경우는 아래 if문들에 안걸리고 그냥 elem의 position만 설정해주고 나감.
  if(option==="create"){
    var el = $(this.getItemCode()+".wait.classitem").width(this.elem_width).height(this.elem_height).offset({top:this.pos_top ,left:this.pos_left});
    el.addClass("classitem_color_"+this.elem_color);
    el.removeClass("wait");
  }else if(option==="resize"){
    // resize case
    // .classitem만 찍으면 element 2개가 둘다 같은 포지션으로 감
    // 객체의 내용과 일치하는 html을 찾기위해 classitem으로 하면 월, 수 이런식으로 나오니 day와 shour로 이루어진 filter 하나 더 거름
    $(this.getItemCode()+".classitem").filter("."+this.day+this.shour).width(this.elem_width).height(this.elem_height).offset({top:this.pos_top ,left:this.pos_left});
  }else if(option==="hover"){
    // hover case
    var hover_el = $(this.getItemCode()+".wait.classitem").width(this.elem_width).height(this.elem_height).offset({top:this.pos_top ,left:this.pos_left});
    hover_el.addClass("hover");
    hover_el.removeClass("wait");
    // class가 hover classitem 인 tag를 찾으면 됨
  }
};

// initialize용 함수. (refresh 버튼 누를 시)
function check_timetable_initialize(){
  if(confirm("시간표를 초기화 하시겠습니까?")){
    timetable_initialize();
  }else{
    return;
  }
}

function timetable_initialize(){
  used_colors = [];
  class_items = [];
  class_elems = [];
  $(".classitems").children().remove();
  update_total_credit();
}

// hover event
function hover_classitem(elem){
  row = time_parser(elem);
  if(row.classtime[0] === "미입력"){return;}

  for(i=0 ; i< row.classtime.length ; i++){
    el = new ClassElement(row,i); // elem 객체 생성
    el.create_html();
    el.setPosition("hover");
  }
}

// insert
function check_insert(){
  if(confirm("추가하시겠습니까?")){
    check = insert_classitem($(".clicked"));
    if("same_value" === check ){
      alert("시간표에 이미 존재하는 수업입니다.");
    }else if("time_info_error"===check){
      alert("시간 정보가 없습니다.");
    }else if("time_overlap"===check){
      alert("시간표에 있는 수업과 시간이 겹칩니다.");
    }
  }else{
    return;
  }
  $(".classitem.hover").remove();
}

function insert_classitem(elem){
  // parse row element
  row = time_parser(elem);

  // Check empty value
  if(row.classtime[0] === "미입력"){
    elem.removeClass("hover"); //remove hover
    return "time_info_error";
  }

  // Make object
  object = new ClassItem(row);

  // Check same value
  if(check_same_value_in_array(class_items, object, 'classcode')){
    elem.removeClass("hover");
    return "same_value";
  }
  // Check time overlapping
  if(check_time_overlapping(row)){
    elem.removeClass("hover");
    return "time_overlap";
  }

  // Insert classitem : no empty, no same, no overlap value
  // Push item to array(class_items)
  class_items.push(object);
  // Set background color (all element in one item has same color)
  bg_color = get_random_item_color();
  // Create each element in item and set position.
  for(i=0 ; i< row.classtime.length ; i++){
    el = new ClassElement(row,i); // Create element
    el.elem_color = bg_color; // Set background color
    class_elems.push(el); // elems 에 넣음
    el.create_html();
    el.setPosition("create");
  }
  // remove hover
  elem.removeClass("hover");
}

function create_virtual_row(){
  // Object {classname: "자료구조", prof: "한승철", credit: "3", classtime: Array(2), classcode: "1133"…}
  //   classcode:"1133"
  //   classname:"자료구조"
  //   classrooms:Array(2)
  //   classtime:Array(2)
  //   credit:"3"
  //   days:Array(2)
  //   prof:"한승철"
  //   times:Array(2)
  var v_row = {};
}

function update_total_credit(){
  result = 0;
  $.each(class_items, function(i, val){
	result+=parseInt(val.credit);
  });
  $("#total_credit").empty();
  $("#total_credit").append(result);
}

function check_overlap(el){
  // 한 수업의 각 요일(class_elems)에 대한 순회
  // el은 순회 시 각 요소 값.
  // some() 을 쓰는 배열 자체
  // insert_el은 넣을 시간, el은 class_elems에 있는 기존 시간들의 요소

  // overlap 되는 경우는 많아서 되지 않는 경우의 수로 계산한다.
  // overlap 되지 않는 경우는 2개
  // 0. 일단 같은 요일에 있는 element 여야 함
  // 1. insert elem 이 비교하는 elem 위에 존재 할 경우
  // 2. insert elem 이 비교하는 elem 밑에 존재 할 경우

  // 1.의 경우 기존 elem 의 top이 insert_top 보다 크고(밑에있고),(&&) insert_bot 보다 크거나 같다(밑에있거나 경계선이 딱 맞다)
  // (elem_top > insert_top) && (elem_top >= insert_bot)
  // 2.의 경우 기존 elem 의 bot 이 insert_top 보다 작거나 같고 (위에있거나 경계선이 딱 맞고) , (&&) insert_bot 보다 작다 (위에 있다)
  // (elem_bot <= insert_top) && (elem_bot < insert_bot)

  if(el.day === insert_el.day){
    // 같은 요일일 때

    insert_el_bot = insert_el.pos_top + insert_el.elem_height;
    el_bot = el.pos_top + el.elem_height;

    if((el.pos_top == insert_el.pos_top) && (el_bot == insert_el_bot)){
      // 시작시간과 끝나는 시간이 아에 똑 같은 경우 => 겹침
      return true;
    }
    if((el.pos_top > insert_el.pos_top) && (el.pos_top >= insert_el_bot)){
      // 1. case
      return false;
    }else if((el_bot <= insert_el.pos_top) &&(el_bot < insert_el_bot)){
      // 2. case
      return false;
    }else{
      // case 1,2 아니면 겹치는 경우임
      return true;
    }

  }else{
    //같은 요일 아니면 그냥 false
    return false;
  }
}

function check_time_overlapping(row){
  // time overlapping 확인
  // object의 elem (수업요일) 개수만큼 loop 돌림 .. 각 elem에서 겹치는 시간 비교하므로.

  for(i=0 ; i<row.classtime.length ; i++){
    insert_el = new ClassElement(row,i); // insert 할 elem의 ClassElement 객체 생성
    insert_el.setPosition();
    if(class_elems !== []){
      if(class_elems.some(check_overlap)){
        // overlap이면 true 줘야함
        return true;
      }
    }
  }
}

function detail_view(item){
  //init
  $('.ui.modal#detail').modal('show');
  $('div.class_info').html("");

  // append html
  html ="<ul>";
  for (var i in item) {
    if (item.hasOwnProperty(i)) {
      html += "<li class='"+i+"''>"+prop_to_kor(i)+" : "+item[i]+"</li>";
    }
  }
  html += "</ul>";
  $('div.class_info').html(html);

  // parameter로 classcode를 넘겨야 해서 modal에서는 button 만들기만하고 onclick은 여기서 줌.
  $(".actions .button").filter("#remove_btn").attr("onclick", "remove_classitem('"+item.classcode+"')");

  color_list ="";
  $.each(full_colors, function(i,val){
    color_list += '<button class="color-box classitem_color_'+val+'" id="'+val+'"> <i class="paint brush icon"></i></button>';
  });
  $("div.horizontal.list").children(".item").append(color_list);
}

function resize_classitem(){
  $.each(class_elems, function(i, val){
    val.setPosition("resize");
  });
}

function remove_classitem(code){
  // remove in array(used_colors)
  item_color = get_matched_color_in_arr(code);
  target_pop(used_colors, item_color);
  // remove in array(class_items, classelems)
  class_items = get_matched_prop_removed_array(class_items, code);
  class_elems = get_matched_prop_removed_array(class_elems, code);

  $('div.classitem').filter("."+code).remove();
  $('.ui.modal#detail').modal('hide');

  update_total_credit();
}
