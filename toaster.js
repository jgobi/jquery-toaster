$.toaster = {

		activeToasts: [], //toasts stack
		currentId: 0, //internal id for toasts
		currentTop: 40, //the 'top' css rule of the next toast (the position of the top vertex of the next toast)
		initialTop: 40, //the position of the top vertex of the first toast
		appearOnLeft: false, //if the toasts will appear on the left or in the rigth (default) side of the screen
		closeOnClick: true, //if the toasts will close if user clicks on any part of it
		defaultTimeout: 5000, //default time for toast automatically vanish
		
		setProps: function(options){
			/**
			 * Set the general options for the toasts. Can be called at any moment, but better before the first toast or never.
			 * 
			 * @param options: an object containing one or more of:
			 * 		- initialTop: number
			 * 		- appearOnLeft: boolean
			 * 		- closeOnClick: boolean
			 * 		- defaultTimeout: number
			 */
				
			if (typeof options.closeOnClick == 'boolean')
				$.toaster.closeOnClick = options.closeOnClick;
			
			if (typeof options.defaultTimeout == 'number')
				$.toaster.defaultTimeout = options.defaultTimeout;
			
			$.toaster.fixPosition(
				(typeof options.initialTop == 'number' ? options.initialTop : $.toaster.initialTop),
				(typeof options.appearOnLeft == 'boolean' ? options.appearOnLeft : $.toaster.appearOnLeft)
			);
		},
		
		fixPosition: function(newInitialTop, newAppearOnLeft){
			/**
			 * This is a PRIVATE function and was not designed to be direct called. Please don't do it.
			 * Fix the position of toasts when initial top or the side change.
			 * 
			 * @param newInitialTop: number
			 * @param newAppearOnLeft: boolean
			 */
			var difference = $.toaster.initialTop - newInitialTop; //evaluate the difference between the new and the old top for moving the existing toasts to the right place.
			
			for(i=0;i<$.toaster.activeToasts.length;i++){ //For each toast
				$( "#toast-"+$.toaster.activeToasts[i] ).animate({ //Move it to the rigth top with an animation
					top: parseInt($("#toast-"+$.toaster.activeToasts[i] ).css("top"))-difference
				}, 100);
			}
			if(newAppearOnLeft != $.toaster.appearOnLeft){ //if appear on left prop has changed
				for(i=0;i<$.toaster.activeToasts.length;i++){ //For each toast
					$( "#toast-"+$.toaster.activeToasts[i] ).slideUp("fast",function(){ //Hide the toasts with animation
						$(this).css({ //Move it to the rigth side
							left: ($.toaster.appearOnLeft ? 0 : ''),
							right: ($.toaster.appearOnLeft ? '' : 0)
						}).slideDown("fast"); //Show again the toasts with animation
					});
				}
			}
			
			$.toaster.appearOnLeft = newAppearOnLeft; //Set the appeatOnLeft to new value
			$.toaster.initialTop = newInitialTop; //Set the top position to new value
			$.toaster.currentTop -= difference; //Update the next toast position
		},
		
		show: function(type,message,options){
			/**
			 * Displays a toast
			 * 
			 * @param type: "info", "success", "warning", "danger"
			 * @param message: string
			 * @param [options]: either a number (timeout of the toast) or a configuration object:
			 * 		- timeout: number
			 * 		- closeOnClick: boolean
			 * 
			 * @return number - the id of the toast showned
			 */
			$.toaster.currentId++; //increment toast id
			var r = $.toaster.currentId;
			$.toaster.activeToasts.push($.toaster.currentId); //add the new toast to the active toasts array
			if( $(window).width() <= 720 ){ //smartphones - will show the toast in the bottom, and only one once.
				if((typeof options.closeOnClick == 'boolean' && options.closeOnClick) || (typeof options.closeOnClick == 'undefined' && $.toaster.closeOnClick)) //closeOnClick
					var toast='<div onclick="$.toaster.hide('+r+')" style="cursor: pointer; ';
				else //close only on X
					var toast='<div style=" ';
					
				toast+='z-index: 999999; width: 100%; position: fixed; left: 0; bottom: 0px; margin:0px" id="toast-' +r+'" data-alert class="alert-box '+type+'">'+message+' &nbsp;&nbsp;&nbsp;<a href="#" onclick="$.toaster.hide('+r+')" class="close">&times;</a></div>';
			}else{ //desktop - will show the toast in the left or rigth side, as defined on appearOnLeft prop.
				if((typeof options.closeOnClick == 'boolean' && options.closeOnClick) || (typeof options.closeOnClick == 'undefined' && $.toaster.closeOnClick)) //closeOnClick
					var toast='<div title="Clique para fechar." onclick="$.toaster.hide('+r+')" style="cursor: pointer; ';
				else
					var toast='<div style=" ';
					
				if($.toaster.appearOnLeft) //appearOnLeft
					toast+='left: 0; ';
				else //appearOnRigth
					toast+='right: 0; ';
					
				toast+='z-index: 999999; position: fixed; top: '+$.toaster.currentTop+'px; margin:20px" id="toast-'+r+'" data-alert class="alert-box '+type+'">'+message+' &nbsp;&nbsp;&nbsp;<a href="#" onclick="$.toaster.hide('+r+')" class="close">&times;</a></div>';
				
			}
			$("body").append(toast); //inserts the toast on the page.
			$.toaster.currentTop+=$("#toast-"+r).outerHeight()+10; //increase the top prop to the apropriate value for the next toast appear (10 is the margin)
			$("#toast-"+r).hide().slideDown("fast"); //Immediately hide the toast and show it again. This way the user see an awesome transition :)
			setTimeout(function(){ //Define the toasts timeout
				$.toaster.hide(r);
			},((typeof options == 'number') ? options : (typeof options.timeout == 'number' ? options.timeout : $.toaster.defaultTimeout))); //if not specified, use the default
			return r; //Returns the id of the new toast
		},

		hide: function(toast){
			/**
			 * Dismiss a toast
			 * 
			 * @param toast: number - the id of the toast to dismiss
			 * 
			 * @return number - the id of the toast dismissed
			 */
			var id=$.toaster.activeToasts.indexOf(toast); //Search for the toast in the active toasts array
			$.toaster.activeToasts.splice(id, 1); //Delete the toast from the active toasts array
			if( $(window).width() <= 720 ){ //smartphones
				$("#toast-"+toast).slideUp("fast",function(){$(this).remove()}); //only hide the toast with an animation and so remove it from the html
			}else{ //desktop
				$("#toast-"+toast).slideUp("fast",function(){ //hide the toast with an animation and...
					var thisHeigth=$("#toast-"+toast).outerHeight()+10; //grab the heigth of the toast to remove (10 is the margin)...
					$.toaster.currentTop-=thisHeigth; //Update currentTop to be the correct position for the next toast.
					$(this).remove(); //properly remove the toast from the html
					for(i=id;i<$.toaster.activeToasts.length;i++){ //for each remaining toast, rearrange they on the screen (avoid wrong spaces between two toasts)
						$( "#toast-"+$.toaster.activeToasts[i] ).animate({ //move they up with an animation
							top: parseInt($("#toast-"+$.toaster.activeToasts[i] ).css("top"))-thisHeigth
						}, 100);
					}
				});
			}
			return toast; //Returns the id of the dismissed toast for no reason. (This is equals to the toast parameter, but ok)
		}
}
