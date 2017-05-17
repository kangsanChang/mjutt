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

function get_random_item_color(available_colors){
  available_colors=["ec555a","c65353","ffccce","f56e3d","f8d56d","cfe19d","34a26b","28bdbd","4280d7","e39dfb"];
  rand_color = available_colors[Math.floor(Math.random() * available_colors.length)];
  return rand_color;
}

function time_parser(elem){
  var row_dict = {};
  // element는 clicked 인 row이므로 무조건 1개라서 0으로 접근
  classname = $(elem)[0].children[1].innerHTML;
  prof = $(elem)[0].children[4].innerHTML;
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
  row_dict.classtime = classtime;
  row_dict.days = days;
  row_dict.times = times;
  row_dict.classrooms = classrooms;
  row_dict.classcode = classcode;

  return row_dict;
}
//
// class ClassItem {
//   constructor(item){
//     this.item = item;
//     this.classname = item.classname;
//     this.prof = item.prof;
//     this.classtime = item.classtime; // array
//     this.classcode = item.classcode;
//   }
//
//   get item_id(){
//     return "#" + this.classcode;
//   }
//
// }
//
// class ClassElement extends ClassItem {
//   constructor(item, i){
//     super();
//     this.day = item.days[i];
//     this.shour = item.times[i][0].split(":")[0]; // start hour
//     this.smin = item.times[i][0].split(":")[1]; // start min
//     this.ehour = item.times[i][1].split(":")[0]; // end hour
//     this.emin = item.times[i][1].split(":")[1]; // end min
//     this.interval_minute = (parseInt(this.ehour) - parseInt(this.shour))*60 + (parseInt(this.emin) - parseInt(this.smin));
//     this.elem_top = "";
//     this.elem_left = "";
//     this.elem_width = "";
//     this.elem_height = "";
//   }
//
//   update_position(){
//     this.elem_width = $("."+this.shour).filter("."+this.day).width();  // cell 한개 너비가 곧 elem의 너비
//     cell_height = $("."+this.shour).filter("."+this.day).height();  // cell 한 개 높이
//     this.elem_height = Math.round(cell_height * (this.interval_minute/60));
//
//     // top position정하기, start hour와 min에 영향을 받는다
//     if(this.smin=="00"){
//       this.elem_top = $("."+this.shour).filter("."+this.day).offset().top +1;
//     }else{
//       // smin이 있을때 top 위치 내려와야 함
//       this.elem_top = $("."+this.shour).filter("."+this.day).offset().top +1;
//       smin_height = Math.round(cell_height *(this.smin/60));
//       item_top += smin_height;
//       // 10:30 시작이면 10시보다 한시간 cell의 1/2 높이만큼 멀어짐(top++)
//     }
//     this.elem_left = $("."+this.shour).filter("."+this.day).offset().left + 2;
//     return;
//   }
// }

function ClassItem(item){
  this.classname = item.classname;
  this.prof = item.prof;
  this.classtime = item.classtime; // array
  this.classcode = item.classcode;

  this.toString = function(){
    return classname + " / " + prof + " / " + classcode;
  };

  this.getItemID = function(){
    return "#"+this.classcode;
  };
}

function ClassElement(item, i){
  // 한 엘리먼트 값임! 한 강의엔 여러 엘리먼트(월,수 수업일 경우 : 2개)가 있음
  // property
  this.classname = item.classname;
  this.prof = item.prof;
  this.classtime = item.classtime; // array
  this.classcode = item.classcode;
  this.classroom = item.classrooms[i];

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

  this.getItemID = function(){
    return "#"+this.classcode;
  };
}

// inheritance
// ClassElement.prototype = new ClassItem();

// method
ClassElement.prototype.make_elem_html= function(){
  html = '<div class="classitem wait" id='+this.classcode+'><div class="content">\
  <strong>'+this.classname+'</strong><br>'+this.prof+'<br>'+this.classroom+'<br></div></div>';

  // 위치 정해지기전 임시 장소에 생긴 후 wait class 받음
  $(".classitems").append(html);
};

ClassElement.prototype.setPosition = function(){
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
  this.elem_left = $("."+this.shour).filter("."+this.day).offset().left+ 2;
};

ClassElement.prototype.highlight_elem = function(color){
  if(this.elem_height === ""){
    console.log("element 의 위치가 설정되지 않았습니다.");
    return;
  }else{
    var temp = $(this.getItemID()+".classitem.wait").width(this.elem_width).height(this.elem_height).offset({top:this.elem_top ,left:this.elem_left});
    // 위치 정해주고 wait class (임시 상태)삭제
    temp.addClass("classitem_color_"+color);
    temp.removeClass("wait");
  }

};

ClassElement.prototype.hover_classitem = function(){

};
class_items = [];
class_elems = []; // resize 시 elem의 포지션을 한번에 조정하기 위함

function insert_classitem(elem){
  row = time_parser(elem);
  class_items.push(row); // 내 수업이 담긴 class_items 배열에 추가
  row_obj = new ClassItem(row);
  bg_color = get_random_item_color();
  for(i=0 ; i< row.classtime.length ; i++){
    temp = new ClassElement(row,i); // elem 객체 생성
    class_elems.push(temp); // elems 에 넣음
    temp.make_elem_html();
    temp.setPosition();
    temp.highlight_elem(bg_color);
  }

  // 랜덤컬러 먹여주면 누가 뭘 가지고 있는지 정보를 저장하고 있지 않음.
  // resize 시 다시 만들어버리면 색을 유지할 방법이 없음
  // resize 시 있는 element의 pos 를 수정해야 배경색이 유지 됨!!! 고쳐라ㄴ



  //remove hover
  elem.removeClass("hover");
  $("td").removeClass("hover");
}

function resize_classitem(elements){
  // elements와 $(".classitem")의 차이점은 elements 는 object가 있는 배열이고 , $()는 현재 시간표위에 있는 div 가져온거임.
  // 갯수는 같음.
  $(".classitem").remove(); // 싹 다 삭제
  $.each(elements, function(i, val){
    val.make_elem_html();
    val.setPosition();
    val.highlight_elem();
  });
}

// $(window).resize(function(){
//   resize_classitem(class_elems);
// });

function activateCSS(){
  $('#table-body .table-row').hover(function(){
    $(this).addClass("hover");
    // set_highlight(time_parser($(this)),"hover");
  }, function(){
    $(this).removeClass("hover");
    $("td").removeClass("hover");
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

//
// var classitems = [];
//
// // // 시간 개수 만큼 element 생성해야 함
// // $.each(item.times, function(i, val){
// //   // val = item.times[i]
// //   item_id = "#" + item.classcode;
// //   var tag = '<div class"classitem" id="'+item_id+'"><div class="inner_content">\
// //   <p>'+item.classname+'<br>'+item.prof+'<br>'+  '(강의실)' +'</p></div></div>';
// //   get_element_detail(item, i);
// // });
//
// function get_element_detail(item, i){
//   // 한 강의의 i번째 수업의 시간을 파싱해서 highlight에 필요한 정보 리턴
//   day = item.days[i];
//   shour = item.times[i][0].split(":")[0]; // start hour
//   smin = item.times[i][0].split(":")[1]; // start min
//   ehour = item.times[i][1].split(":")[0]; // end hour
//   emin = item.times[i][1].split(":")[1]; // end min
//
//   element.interval_minute = (parseInt(ehour) - parseInt(shour))*60 + (parseInt(emin) - parseInt(smin));
//   element.cls_shour = "."+ shour;
//   element.cls_day = '.'+day;
//   element.smin = smin;  // top위치 정할 때 smin 필요함
//
//   return element;
// }
//
// function set_highlight(item_id, elem){
//   // 랜덤컬러도 해줘야 함
//   cell_width = $(elem.cls_shour).filter(elem.cls_day).width();
//   cell_height = $(elem.cls_shour).filter(elem.cls_day).height();
//
//   item_width = cell_width;
//   item_height = Math.round(cell_height * (elem.interval_minute/60));
//
//   if(smin=="00"){
//     item_top = $(elem.cls_shour).filter(elem.cls_day).offset().top +1;
//   }else{
//     // smin이 있을때 top 위치 내려와야 함
//     item_top = $(elem.cls_shour).filter(elem.cls_day).offset().top +1;
//     smin_height = Math.round(cell_height *(elem.smin/60));
//
//     item_top += smin_height;
//   }
//
//   item_left = $(elem.cls_shour).filter(elem.cls_day).offset().left + 2;
//   $(item_id+".classitem").width(elem_width).height(elem_height).offset({top:elem_top ,left:elem_left});
// }
