$.toaster = {

		active_toasts: [],
		current_id: 0,
		current_top: 40,

		show: function(type,message,timeout){
			$.toaster.current_id++;
			var r = $.toaster.current_id;
			$.toaster.active_toasts.push($.toaster.current_id);
			if( $(window).width() <= 720 ){ //celulares
				var toast='<div style="z-index: 999999; width: 100%; position: fixed; left: 0; bottom: 0px; margin:0px" id="toast-'+r+'" data-alert class="alert-box '+type+'">'+message+' &nbsp;&nbsp;&nbsp;<a href="#" onclick="$.toaster.hide('+r+')" class="close">&times;</a></div>';
			}else{ //desktop
				var toast='<div style="z-index: 999999; position: fixed; right: 0; top: '+$.toaster.current_top+'px; margin:20px" id="toast-'+r+'" data-alert class="alert-box '+type+'">'+message+' &nbsp;&nbsp;&nbsp;<a href="#" onclick="$.toaster.hide('+r+')" class="close">&times;</a></div>';
			}
			$("body").append(toast);
			$.toaster.current_top+=$("#toast-"+r).outerHeight()+10;
			$("#toast-"+r).hide().slideDown("fast");
			$(document).foundation();
			setTimeout(function(){
				$.toaster.hide(r);
			},((typeof timeout !== 'undefined') ? timeout : 5000));
			return r;
		},

		hide: function(toast){
			var id=$.toaster.active_toasts.indexOf(toast);
			$.toaster.active_toasts.splice(id, 1);
			if( $(window).width() <= 720 ){ //celulares
				$("#toast-"+toast).slideUp("fast",function(){$(this).remove()});
			}else{ //desktop
				$("#toast-"+toast).slideUp("fast",function(){
					var this_heigth=$("#toast-"+toast).outerHeight()+10;
					$.toaster.current_top-=this_heigth;
					$(this).remove();
					for(i=id;i<$.toaster.active_toasts.length;i++){
						$( "#toast-"+$.toaster.active_toasts[i] ).animate({
							top: parseInt($("#toast-"+$.toaster.active_toasts[i] ).css("top"))-this_heigth
						}, 100);
					}
				});
			}
			return toast;
		}
}
