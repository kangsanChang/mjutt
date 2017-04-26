$(document).ready(function(){
  $('.table-row').hover(function(){
    $(this).addClass("hover");
  }, function(){
    $(this).removeClass("hover");
  });

  $('.table-row').click(function(event){
    $('.table-row').not(this).removeClass('clicked');
    $(this).toggleClass("clicked");
  });
});
