// runtime script when application running.
// like hover event handler
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
    $('.ui.modal').modal('show');
  });

  // .classitem hover event (using box-shadow)
  $(document).on("mouseover",'div.classitem',function(e){
    $(this).addClass("box-shadow");
  }).on("mouseout",'div.classitem',function(e) {
    $(this).removeClass("box-shadow");
  });

  $(document).on("click","div.classitem" ,function(){
	   a=this;
     b=$(this);
     console.log(this.id);
  });

});
