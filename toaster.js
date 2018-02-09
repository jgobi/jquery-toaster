$.toaster = {

	activeToasts: [], //toasts stack
	currentId: 0, //internal id for toasts
	currentTop: 40, //the 'top' css rule of the next toast (the position of the top vertex of the next toast)
	initialTop: 40, //the position of the top vertex of the first toast
	appearOnLeft: false, //if the toasts will appear on the left or in the right (default) side of the screen
	closeOnClick: true, //if the toasts will close if user clicks on any part of it
	defaultTimeout: 5000, //default time for toast automatically vanish
	
	/**
	 * Set the general options for the toasts. Can be called at any moment, but better before the first toast or never.
	 * 
	 * @param {object} options: an object containing one or more of:
	 * 		- initialTop: number
	 * 		- appearOnLeft: boolean
	 * 		- closeOnClick: boolean
	 * 		- defaultTimeout: number
	 */
	setProps: function(options){
			
		if (typeof options.closeOnClick == 'boolean')
			$.toaster.closeOnClick = options.closeOnClick;
		
		if (typeof options.defaultTimeout == 'number')
			$.toaster.defaultTimeout = options.defaultTimeout;
		
		$.toaster.fixPosition(
			(typeof options.initialTop == 'number' ? options.initialTop : $.toaster.initialTop),
			(typeof options.appearOnLeft == 'boolean' ? options.appearOnLeft : $.toaster.appearOnLeft)
		);
	},

	/**
	 * This is a PRIVATE function and was not designed to be direct called. Please don't do it.
	 * Fix the position of toasts when initial top or the side change.
	 * 
	 * @param {number} newInitialTop
	 * @param {boolean} newAppearOnLeft
	 */
	fixPosition: function(newInitialTop, newAppearOnLeft){
		
		var difference = $.toaster.initialTop - newInitialTop; //evaluate the difference between the new and the old top for moving the existing toasts to the right place.
		
		$.toaster.activeToasts.forEach(function adjustPositionY() { //For each toast
			$( "#toast-"+$.toaster.activeToasts[i] ).animate({ //Move it to the right top with an animation
				top: parseInt($("#toast-"+$.toaster.activeToasts[i] ).css("top"))-difference
			}, 100);
		});

		if(newAppearOnLeft != $.toaster.appearOnLeft){ //if appear on left prop has changed
			$.toaster.activeToasts.forEach(function adjustPositionX() { //For each toast
				$( "#toast-"+$.toaster.activeToasts[i] ).slideUp("fast", function (){ //Hide the toasts with animation
					$(this).css({ //Move it to the right side
						left: ($.toaster.appearOnLeft ? 0 : ''),
						right: ($.toaster.appearOnLeft ? '' : 0)
					}).slideDown("fast"); //Show again the toasts with animation
				});
			});
		}
		
		$.toaster.appearOnLeft = newAppearOnLeft; //Set the appearOnLeft to new value
		$.toaster.initialTop = newInitialTop; //Set the top position to new value
		$.toaster.currentTop -= difference; //Update the next toast position
	},
	
	/**
	 * Displays a toast
	 * 
	 * @param {string} type One of these: "info", "success", "warning", "danger"
	 * @param {string} message The message to show
	 * @param {number|object} [options] Either a timeout for the toast or a configuration object with:
	 *							 		- timeout: number
	 * 									- closeOnClick: boolean
	 * 								   If none is supplied, the default timeout is used
	 * 
	 * @return {number} the id of the toast showed
	 */
	show: function(type,message,options){
		$.toaster.activeToasts.push(++$.toaster.currentId); //add the new toast to the active toasts array

		if((typeof options.closeOnClick == 'undefined' && $.toaster.closeOnClick) || options.closeOnClick) //closeOnClick
			var toast = '<div onclick="$.toaster.hide(' + $.toaster.currentId + ')" style="cursor: pointer; ';
		else //close only on X
			var toast = '<div style="z-index: 999999; position: fixed;  ';

		if( $(window).width() <= 720 ) //smartphones - will show the toast in the bottom, and only one once.
			toast += 'width: 100%; left: 0; bottom: 0px; margin:0px" ';
		else{ //desktop - will show the toast in the left or right side, as defined on appearOnLeft prop.
			toast += $.toaster.appearOnLeft ? 'left: 0; ' : 'right: 0; ';
			toast += 'top: '+$.toaster.currentTop+'px; margin:20px" title="Clique para fechar." ';
		}

		toast += 'id="toast-'+$.toaster.currentId+'" data-alert class="alert-box '+type+'">'+message+' &nbsp;&nbsp;&nbsp;<a href="#" onclick="$.toaster.hide('+$.toaster.currentId+')" class="close">&times;</a></div>';

		$("body").append(toast); //inserts the toast on the page.
		$.toaster.currentTop += $("#toast-"+$.toaster.currentId).outerHeight()+10; //increase the top prop to the appropriate value for the next toast appear (10 is the margin)
		$("#toast-"+$.toaster.currentId).hide().slideDown("fast"); //Immediately hide the toast and show it again. This way the user see an awesome transition :)
		setTimeout(function(){ //Define the toasts timeout
			$.toaster.hide($.toaster.currentId);
		},((typeof options == 'number') ? options : (typeof options.timeout == 'number' ? options.timeout : $.toaster.defaultTimeout))); //if not specified, use the default
		return $.toaster.currentId; //Returns the id of the new toast
	},

	/**
	 * Dismiss a toast
	 * 
	 * @param {number} toast The id of the toast to dismiss
	 * 
	 * @return {number} The id of the toast dismissed
	 */
	hide: function(toast){
		var id=$.toaster.activeToasts.indexOf(toast); //Search for the toast in the active toasts array
		$.toaster.activeToasts.splice(id, 1); //Delete the toast from the active toasts array
		if( $(window).width() <= 720 ){ //smartphones
			$("#toast-"+toast).slideUp("fast",function(){$(this).remove()}); //only hide the toast with an animation and so remove it from the html
		}else{ //desktop
			$("#toast-"+toast).slideUp("fast",function(){ //hide the toast with an animation and...
				var thisHeight=$("#toast-"+toast).outerHeight()+10; //grab the height of the toast to remove (10 is the margin)...
				$.toaster.currentTop-=thisHeight; //Update currentTop to be the correct position for the next toast.
				$(this).remove(); //properly remove the toast from the html
				
				$.toaster.activeToasts.forEach(function adjustPositionYOnHide() { //for each remaining toast, rearrange they on the screen (avoid wrong spaces between two toasts)
					$( "#toast-"+$.toaster.activeToasts[i] ).animate({ //move they up with an animation
						top: parseInt($("#toast-"+$.toaster.activeToasts[i] ).css("top"))-thisHeight
					}, 100);
				});
			});
		}
		return toast; //Returns the id of the dismissed toast for no reason. (This is equals to the toast parameter, but ok)
	}
}
