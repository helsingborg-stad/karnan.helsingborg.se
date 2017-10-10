var karnan;

$(function(){
    $("body").mousewheel(function(event) {
      event.preventDefault();
      this.scrollTop -= (event.deltaY * event.deltaFactor * -1);
    });
});
