// runtime script when application running.
// like hover, click event handler
$(document).ready(function(){
  $(window).resize(function(){
    resize_classitem();
  });

  $(document).on("click", '#table-body .table-row', function(event){
    // 선택한 element 제외한 row들은 clicked 헤제
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

  // row 에 hover event 설치
  $(document).on("mouseover",'#table-body .table-row',function(e){
    $(this).addClass("hover");
    hover_classitem($(this));
  }).on("mouseout",'#table-body .table-row',function(e) {
    $(this).removeClass("hover");
    $(".classitem.hover").remove(); // hover item 삭제
  });

  // .time-cell hover event
  $('.time-cell').hover(function(){
    $(this).addClass("hover");
  }, function(){
    $(this).removeClass("hover");
  });

  // .time-cell click event
  $('.time-cell').click(function(e){
    custom_input_modal(this);
  });

  // .classitem hover event (using box-shadow)
  // 같은 id 인 놈을 찾아서 같이 highlight
  $(document).on("mouseover",'div.classitem',function(e){
    $("div.classitem."+this.id).addClass("box-shadow");
  }).on("mouseout",'div.classitem',function(e) {
    $("div.classitem."+this.id).removeClass("box-shadow");
  });

  $(document).on("click","div.classitem" ,function(){
    target=this.id;
    var obj = get_matched_objects_in_arr(class_items, target);
    detail_view(obj[0]); // modal 실행하고 detail_html 의 return 값 html 넣기
    // get_mated.. 함수는 배열로 리턴하는데 item은 한개밖에 없으므로 0으로 접근
  });

  $(document).on("click", "div.ui.cancel.button", function(){
    $("#custom_form").form('reset'); // form('reset') 은 default value 상태로, form(clear) 는 깨끗히 폼 다 비움
  });

  $(document).on("click", '.ui.button#setting', function(){
    $('.ui.button#setting').popup();
  });

});
