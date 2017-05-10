function check_insert(){
  if(confirm("추가하시겠습니까?")){
    insert_classitem($(".clicked"));
  }else{
    alert("close");
  }
}

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

function random_table_color(){
  var colors = new Array("red","orange","yellow","olive","green","teal","blue",
  "violet","purple","pink","grey","black");
  return colors[Math.floor(Math.random() * colors.length)];
}

function random_item_color(){
  var colors = new Array()
  // selected라고 되어있는 element 찾아서 배열에서 중복되는 색 뺴준 후 랜덤 리턴.

}

function time_parser(elem){
  var row_dict = {};
  classname = $(elem)[0].children[1].innerHTML;
  prof = $(elem)[0].children[4].innerHTML;
  classtime = $(elem)[0].children[7].innerHTML.split(","); //["월13:00-14:50 (Y5420)", "수13:00-14:50 (Y5420)"]

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
      if(classroom == null){
        classrooms.push("empty");
      }else{
        classrooms.push(classroom[0]);
      }
    }
  });

  row_dict['classname'] = classname;
  row_dict['prof'] = prof;
  row_dict['classtime'] = classtime;
  row_dict['days'] = days;
  row_dict['times'] = times;
  row_dict['classrooms'] = classrooms;

  return row_dict;
}

function set_highlight(rowobj, option){
  // row의 time parsing 된 dictionary 받아 hover event 줌
  $.each(rowobj['days'], function(i,val){
    // make string like "09-under30-Mon"
    if(rowobj['days']=='empty'){
      // pass
    }else{
      start_cell_id = "#";
      end_cell_id = "#";
      // start time : times[i][0] , end time:tiems[i][1]
      shour = rowobj['times'][i][0].split(":")[0] // start hour
      smin = rowobj['times'][i][0].split(":")[1] // start min
      ehour = rowobj['times'][i][1].split(":")[0] // end hour
      emin = rowobj['times'][i][1].split(":")[1] // end min

      // fill start time
      if(parseInt(smin) >= 30){
        // 시작 시간이므로 30분도 포함해서 가야함
        start_cell_id += shour + "-" + "over30" + "-" + day_to_code(val);
        $(start_cell_id).addClass(option);
      }else{
        start_cell_id += shour + "-" + "under30" + "-" + day_to_code(val);
        $(start_cell_id).addClass(option);
      }
      // fill end time
      // 21시 넘는경우 끝까지 칠함
      if(parseInt(ehour)>=21){
        end_cell_id += "20-over30-"+day_to_code(val);
        $(end_cell_id).addClass(option);
      }else{
        if(parseInt(emin) > 30){
          // 끝 시간이므로 30분일 경우 딱 거기까지 칠하면 됨
          end_cell_id += ehour + "-" + "over30" + "-" + day_to_code(val);
          $(end_cell_id).addClass(option);
        }else{
          end_cell_id += ehour + "-" + "under30" + "-" + day_to_code(val);
          $(end_cell_id).addClass(option);
        }
      }
    }

    // fill interval 화15:00-17:50 (Y5411)
    if (parseInt(shour)==parseInt(ehour)){
      // pass
    }else{
      if(parseInt(smin)<30){
        // + start hour-over case
        interval_cell_id = "#" + shour + "-"+ "over30" + "-" + day_to_code(val);
        $(interval_cell_id).addClass(option);
      }
      interval = parseInt(shour) + 1;
      while(interval != parseInt(ehour)){
        // + time interval
        interval_cell_id = "#" + interval + "-" + "under30" + "-" + day_to_code(val);  // interval이 int 지만 알아서 형변환
        $(interval_cell_id).addClass(option);
        interval_cell_id = "#" + interval + "-" + "over30" + "-" + day_to_code(val);
        $(interval_cell_id).addClass(option);
        interval += 1;
      }

      if(parseInt(emin)>30){
        // + end hour-under case
        interval_cell_id = "#" + ehour + "-" + "under30" + "-" + day_to_code(val);
        $(interval_cell_id).addClass(option);
      }
    }
  });
}

function insert_classitem(elem){
  row = time_parser(elem);
  set_highlight(row, "selected");
  //remove hover
  elem.removeClass("hover");
  $("td").removeClass("hover");
}


function activateCSS(){
  $('.table-row').hover(function(){
    $(this).addClass("hover");
    set_highlight(time_parser($(this)),"hover");
  }, function(){
    $(this).removeClass("hover");
    $("td").removeClass("hover");
  });

  $('.table-row').click(function(event){
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


function add_timetable(){
  //tab 개수 구한 후 추가
  switch ($('#timetable-tab').children('a').length) {
    case 1:
      data_tab = "second";
      tab_html = "PLAN B";
      color = random_table_color();
      break;
    case 2:
      data_tab = "third";
      tab_html = "PLAN C";
      color = random_table_color();
      break;
    default:
      alert("더이상 추가할 수 없습니다.");
      return;
  }
  $("#timetable-tab").children($('a')).removeClass("active"); // tab 의 a 태그 에서 active 제거
  $("#timetable-tab").siblings(".active").removeClass("active"); // tab 내용에서 active 제거
  $('<a class="item active" data-tab="'+data_tab+'">'+tab_html+'</a>').insertBefore($("#add-timetable"));
  $("#my-timetable").append($('<div class="ui bottom attached tab segment active" data-tab="'+data_tab+'">\
    <table class="ui celled '+color+' table">\
        <thead>\
          <tr>\
            <th>/</th>\
            <th>월요일</th>\
            <th>화요일</th>\
            <th>수요일</th>\
            <th>목요일</th>\
            <th>금요일</th>\
          </tr>\
        </thead>\
        <tbody>'));
  tbody_html="";
  for(i=1; i<13; i++){
    hour = i+8;
    if(hour.toString().length == 1){ // 9 시 이하면(한자리수 시간) 0 붙여줌
      start="0"+hour;
    }else{
      start=hour;
    }
    end = hour+1;
    tbody_html +=
    '<tr>\
      <td rowspan="2">'+i+'교시<br>('+start+'~'+end+')</td>\
      <td id="'+start+'-under30-Mon"></td>\
      <td id="'+start+'-under30-Tue"></td>\
      <td id="'+start+'-under30-Wed"></td>\
      <td id="'+start+'-under30-Thu"></td>\
      <td id="'+start+'-under30-Fri"></td>\
    </tr>\
    <tr>\
      <td id="'+start+'-over30-Mon"></td>\
      <td id="'+start+'-over30-Tue"></td>\
      <td id="'+start+'-over30-Wed"></td>\
      <td id="'+start+'-over30-Thu"></td>\
      <td id="'+start+'-over30-Fri"></td>\
    </tr>\
    ';
  }
  $("[data-tab="+data_tab+"]").children($("tbody")).append(tbody_html).append("</tbody>\
    </table>\
  </div>");

  $('.tabular.menu .item').tab();  // Activate tab in semantic ui
}


function remove_timetable(){
  if($("#timetable-tab").children(".active").attr("data-tab") == "first"){
    alert("PLAN A는 삭제할 수 없습니다.");
    return;
  }else{
    $("#timetable-tab").children(".active").remove();
    $("#timetable-tab").siblings(".active").remove();

    // $("[data-tab=xxxx]")
    $.each($("#timetable-tab").children('a'),function(index, value){
      if(index==0){
        $("#timetable-tab").children('a').eq(index).attr("data-tab","first");
        $("#timetable-tab").siblings().eq(index).attr("data-tab","first");
        $("#timetable-tab").children('a').eq(index).text("PLAN A");
      }
      if(index==1){
        $("#timetable-tab").children('a').eq(index).attr("data-tab","second");
        $("#timetable-tab").siblings().eq(index).attr("data-tab","second");
        $("#timetable-tab").children('a').eq(index).text("PLAN B");
      }
    });
    $("#timetable-tab").children('a').eq(0).addClass("active");
    $("#timetable-tab").siblings().eq(0).addClass("active");
  }
  $('.tabular.menu .item').tab();  // Activate tab in semantic ui
}
