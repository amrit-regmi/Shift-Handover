<script type="text/javascript">
$(document).ready(function() {
	
	var test = true;
	var sendTo = 'https://script.google.com/macros/s/AKfycbwqAAovEZSfE9XBCPqICS_UP20rPgLdKs9IZbFNzO-hAph__HgX/exec';
	var ua = window.navigator.userAgent;
	var station = "";
	var browser = "";
	var handoverId ="";
	var activeStaff="";
	
	var inst_Link = "https://drive.google.com/file/d/1IMWf2oeJDSonQpv0z0DiYO_tII6zoMYE/preview"
	if(!(/chrom(e|ium)/.test( window.navigator.userAgent.toLowerCase()))){
		alert("Please use this program with Google Chrome Browser. Support for other browser has been discontinued, sorry for inconvenience ");
		$('.container').hide();
		return;
	}
	
	checkCurrentVersion();
	
	$(document).on("click", "#chooseStation", function() {
		
		if(station){
			
			loadHandoverPage(station);
				
		}else{
			$('.chooseStation').effect( "bounce", "slow" );
			$('.chooseStation').children(':first').addClass('error');
		}
		
		if($("#remember").is(':checked')){
			localStorage.setItem("station",station);
			
		}
		
		
		
	

    });
	
	


	
	$(document).on("click", "input[name=radioButtonStation]", function() {
		$('.chooseStation').children(':first').removeClass('error')
		station=$(this).val();

    });
	
	function loadHandoverPage(station){
	
		$(".chooseStation").hide();
		$('.loader').show();
	    $.getJSON(sendTo + "?callback=?", {
            method: "getHandover",
            station: station,
        },
        function(data) {
			if(activeStaff =="" ){
				$.getJSON(sendTo + "?callback=?", {
				method: "getStaffList",
				},				
					function(data) {
						activeStaff = data
						$('input[name*="staff_name"]').each(function(i, obj) {
						autocomplete("#"+$(obj).attr("id"),activeStaff);
						});
						autocomplete("#search_name",activeStaff);
					});
			}
			
			$('#station').html(stationAbbr(station, false)+" <a class=\"resetStation\" href=\"#\" style=\"font-weight:normal\"></a>");
			
			handoverId = data['Id'];
			var savedData = checkSavedData(station);
			$('.loader').hide();
			
			if(savedData != ""){

				$( ".NewHandoverBtn" ).trigger( "click" );
				
				$('.newhandover').empty();
				$('.newhandover').append(savedData['htmldata']);

				for (var id in savedData['values'])
				{
					 $("#"+id).val(savedData['values'][id]);
				
				}
				$('.viewhandover').empty();
				$('.viewhandover').append(savedData['LastHandover']);
				
				
				var alert = "<div class=\"alert customAlert alert-warning alert-dismissible fade show\" role=\"alert\"><strong>Loaded from Saved Data!</strong><br> Note that this is loaded from previously saved data. Click Reset to create new.<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>"
				
				$(alert).insertAfter($('.menubar'));
				$('.ResetHandoverBtn').show()
				$('.alert').alert()
				
					$(".popovernote").popover({
					container: '.content',
					html: true
				});
				
		
				$('div[id^="datetimepicker"]').each(function(i, obj) {
					formatDateTimePicker($(obj).attr("id"));
				});
				
				$('div[id^="datetimepicker"]').each(function(i, obj) {
					formatDateTimePicker($(obj).attr("id"));
				});
				
				$('input[name*="staff_name"]').each(function(i, obj) {
					autocomplete("#"+$(obj).attr("id"),activeStaff);
				});
				actionDropDowns();
				
				return
			}
			
			else{
				$(".viewhandover").show(); 
				$(".menubar").show();$('.NewHandoverBtn').show();
            }
			var lastHandover = data;
			$('html,body').animate({
            scrollTop: 0
        }, 700);


            //$("#handover_id").html(lastHandover['rowNumber']);

           
  
            var staff = lastHandover['Staff'];
			
            for (k in staff) {
				var st =staff[k]['starttime'] ||""
				var et = staff[k]['endtime'] ||""
                $('.shift_info').append('<tr><td class ="border border-primary shadow  bg-white rounded" style="    padding: 0.5rem 1rem 0.5rem 0.5rem;">'+staff[k]['name']+'</td><td style="    padding: 0.5rem 1rem 0.5rem 0.5rem;"class ="border border-primary shadow  bg-white rounded" >'+st+'</td><td style="    padding: 0.5rem 1rem 0.5rem 0.5rem;" class ="border border-primary shadow  bg-white rounded" >'+et+'</td></tr>');
            }

            $('#starttime').html(lastHandover['Start Time']); 
			$('#endtime').html(lastHandover['End Time']);
			$('#shift').html(lastHandover['shift']);
			$('#Inv_user').html(lastHandover['Inventory Performed By'])
            for (aircraftName in lastHandover['Work Performed On']) {
				
                var aircraftTable = "<div class=\"workAircraftExpand\" ><table class=\"table table-bordered\" style=\"margin-bottom:1rem;\"id=\"handover_" + aircraftName + "\"><thead class=\"thead-light\"><tr><th style=\"width:5%;\"><\/th><th class=\"text-center\" style=\"width:95%;\"><strong>" + aircraftName.toUpperCase() + "</strong><\/th><\/tr><\/thead><tbody> <\/tbody><\/table><\/div>";
                $('.workperformed').append(aircraftTable);

                var taskDetail = (lastHandover['Work Performed On'][aircraftName]);
                for (taskIndex in taskDetail) {
                    var taskRow = "<tr><td style=\"width:5%;\">" + (parseInt(taskIndex) + 1) + "<\/td><td id='td_" + aircraftName.toLowerCase() +"_" +(parseInt(taskIndex) + 1) + "' style=\"width:95%;\"><\/td><\/tr>"
                    $("#handover_" + aircraftName + " tbody").append(taskRow);

                    var task = taskDetail[taskIndex];
                    var note = "";
					
					var actionLabel ="<span class=\"badge badge-danger\">Action  Required </span><br>";

                    //Check If the task is completed, deferred or requires action 
                    if (RegExp("Completed").test(task[1])) {

                        note = "<span class=\"badge badge-primary\">Action from last last Shift:"+ "   "  +" </span><span class=\"badge badge-success action_badge\"> " + task[1] + "<\/span><span id=\"btn_view_note_" + aircraftName + "_task_" + (parseInt(taskIndex) + 1) + "\"></span><br>";
						actionLabel ="";
						
                    } else if (RegExp("Deferred").test(task[1])) {
                        note = "<span class=\"badge badge-primary\">Action from last last Shift:"+ "   "  +" </span><span class=\"badge badge-warning action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_" + aircraftName + "_task_" +(parseInt(taskIndex) + 1) + "\"></span><br>";                         

                    }else if (RegExp("No action Required").test(task[1])) {
                        note = "<span class=\"badge badge-primary\">Action from last last Shift:"+ "   "  +" </span><span class=\"badge badge-warning action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_" + aircraftName + "_task_" + (parseInt(taskIndex) + 1) + "\"></span><br>";   
						actionLabel ="";
						dropDownMenu ="";

                    }else if(!RegExp("Action Required").test(task[1])){
						actionLabel ="";
						dropDownMenu ="";
					}
					
                    $("#td_" + aircraftName.toLowerCase()+"_" +(parseInt(taskIndex) + 1)).append(note);

                    // check if there is  note to task if true add popover note
					var notebutton="";
                    if (!(typeof task[2] == "undefined") && task[2].trim() !="") {

                        notebutton = "<button type=\"button\"	 onclick=\"false\" class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History:\" data-trigger=\"focus\" data-content=\"" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
                        $("#btn_view_note_" + aircraftName + "_task_" + (parseInt(taskIndex) + 1)).append(notebutton);
                        $(".popovernote").popover({
                            container: '.content',
                            html: true
                        });
                    }

                    //check if the task requires action or not	

                    $("#td_" + aircraftName.toLowerCase() +"_"+ (parseInt(taskIndex) + 1)).append(actionLabel + task[0]);
					
					if(RegExp("Action Required").test(task[1]) || RegExp("Deferred").test(task[1])){
					
						if(notebutton){
							notebutton  = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"<b>"+$('#td_'+aircraftName+"_"+(parseInt(taskIndex) + 1) +' .action_badge').text()+"</b><br>" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
						}
						
						/*<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-primary btn-xs action\"style=\"width:100%\">Completed at Another Station<\/button>\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-danger btn-xs action\"style=\"width:100%\">Deferred to Another Station<\/button>\n					*/
						
						var dropDownMenu = "<div class=\"clearfix actionrequired\"><div class=\"td_action\"><div class=\"dropdown float-left\"><button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-danger btn-xs dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Action Required <\/button><div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-success btn-xs action\" style=\"width:100%\">Completed<\/button>\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-warning btn-xs action\"style=\"width:100%\">Deferred to next shift<\/button>\n<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-primary btn-xs action\"style=\"width:100%\">No action Required<\/button><\/div>\n <\/div><input type=\"hidden\" id=\"action_select\" name=\"" + aircraftName + "_task_" + (parseInt(taskIndex) + 1) + "_action\" required ><\/div> <div class=\"float-left actionUser\"><\/div><div class=\"float-left additionalNote\"><\/div>"+notebutton+"<\/div>"
						
						checkedAircraft(aircraftName.toLowerCase(), true);
						
						var rowNum = $('#'+ aircraftName.toLowerCase()+"_table tbody tr").length;
						var row = "<tr style=\"background-color:#5a7c030f;\"><td>"+rowNum+"</td><td id=\"actionfromLastHandover_"+ aircraftName.toLowerCase()+"_"+(parseInt(taskIndex) + 1)+"\">"+dropDownMenu + task[0]+"<\/td><td></td><td></td><\/tr>"
						$(row).insertBefore($("#" + aircraftName.toLowerCase() + " #addButton"));
					}
                }
            }
			
			if(!lastHandover.hasOwnProperty('Inventory Findings')){
				$('.findings_comment').html("No Findings")
			
			}else{
				for (comment in lastHandover['Inventory Findings']) {
                var task = lastHandover['Inventory Findings'][comment];
                var taskRow = "<tr><td style=\"width:5%;\">" + (parseInt(comment) + 1) + "<\/td><td id='td_findings_" + (parseInt(comment) + 1)+ "' style=\"width:95%;\"><\/td><\/tr>"
                $("#handover_findings tbody").append(taskRow);
                var note = "";
                
                
				var actionLabel ="<span class=\"badge badge-danger\">Action  Required </span><br>";

                    //check if the task is new or deferred
					if (RegExp("Completed").test(task[1])) {
						note = "<span class=\"badge badge-primary\"><strong>Action from last last Shift:<\/strong>"+ "   "  +" </span><span class=\"badge badge-success action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_findings_task_" + (parseInt(comment) + 1) + "\"></span><br>";					
						actionLabel ="";
						
					} 
					else if (RegExp("Deferred").test(task[1])) {
						note ="<span class=\"badge badge-primary\"><strong>Action from last last Shift:<\/strong>"+ "   "  +" </span><span class=\"badge badge-warning action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_findings_task_" + (parseInt(comment) + 1)+ "\"></span><br>";
                        if (!RegExp("Deferred to next").test(task[1]) && !RegExp("Deferred action from").test(task[1])){
						actionLabel ="";
						
						}
					}
					else if(!RegExp("Action Required").test(task[1])){
						actionLabel ="";
					}
				
				
					$("#td_findings_" + (parseInt(comment) + 1)).append(note);    
					$("#td_findings_" + (parseInt(comment) + 1)).append(actionLabel + task[0]);
                     
					 // check if there is deferred note to task if true add popover note
					 var notebutton="";

                    if (!(typeof task[2] === 'undefined') && task[2].trim() !="") {
                            var notebutton = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
                            $("#btn_view_note_findings_task_" + (parseInt(comment) + 1)).append(notebutton);
                            $(".popovernote").popover({
                                container: 'body',
                                html: true
                            });
                        }
					
					if(RegExp("Action Required").test(task[1]) || RegExp("Deferred").test(task[1])){
						
						if(notebutton){
							notebutton  = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"<b>"+$('#td_findings_'+(parseInt(comment) + 1)+' '+'.action_badge').text()+"</b><br>" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
						}
						
						var dropDownMenu = "<div class=\"clearfix actionrequired\"><div class=\"td_action\"><div class=\"dropdown float-left\"><button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-danger btn-xs dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Action Required <\/button><div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-success btn-xs action\" style=\"width:100%\">Completed<\/button>\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-warning btn-xs action\"style=\"width:100%\">Deferred to next shift<\/button>\n<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-primary btn-xs action\"style=\"width:100%\">No action Required<\/button>	<\/div>\n <\/div><input type=\"hidden\" id=\"action_select\" name=\"findings_task_" + (parseInt(comment) + 1) + "_action\" required ><\/div> <div class=\"float-left actionUser\"><\/div><div class=\"float-left additionalNote\"><\/div>"+notebutton+"<\/div>"
						
						var rowNum = $("#findings_table tbody tr").length;
						var row = "<tr  style=\"background-color:#5a7c030f;\"><td>"+rowNum+"</td><td id=\"actionfromLastHandover_findings_"+(parseInt(comment) + 1)+"\">"+dropDownMenu + task[0]+"<\/td><td></td><td></td><\/tr>"
						 $(row).insertBefore($("#findings_table #addButton"));
					}                

            }
			
			
			
			}

            for (comment in lastHandover['Logistics Comments']) {
                var task = lastHandover['Logistics Comments'][comment];
                var taskRow = "<tr><td style=\"width:5%;\">" + (parseInt(comment) + 1) + "<\/td><td id='td_logistics_" + (parseInt(comment) + 1)+ "' style=\"width:95%;\"><\/td><\/tr>"
                $("#handover_logistics tbody").append(taskRow);
                var note = "";
                
                
				var actionLabel ="<span class=\"badge badge-danger\">Action  Required </span><br>";

                    //check if the task is new or deferred
					if (RegExp("Completed").test(task[1])) {
						note = "<span class=\"badge badge-primary\"><strong>Action from last last Shift:<\/strong>"+ "   "  +" </span><span class=\"badge badge-success action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_logistics_task_" + (parseInt(comment) + 1) + "\"></span><br>";					
						actionLabel ="";
						
					} 
					else if (RegExp("Deferred").test(task[1])) {
						note ="<span class=\"badge badge-primary\"><strong>Action from last last Shift:<\/strong>"+ "   "  +" </span><span class=\"badge badge-warning action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_logistics_task_" + (parseInt(comment) + 1)+ "\"></span><br>";
                        if (!RegExp("Deferred to next").test(task[1]) && !RegExp("Deferred action from").test(task[1])){
						actionLabel ="";
						
						}
					}
					else if(!RegExp("Action Required").test(task[1])){
						actionLabel ="";
					}
				
				
					$("#td_logistics_" + (parseInt(comment) + 1)).append(note);    
					$("#td_logistics_" + (parseInt(comment) + 1)).append(actionLabel + task[0]);
                     
					 // check if there is deferred note to task if true add popover note
					 var notebutton="";

                    if (!(typeof task[2] === 'undefined') && task[2].trim() !="") {
                            var notebutton = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
                            $("#btn_view_note_logistics_task_" + (parseInt(comment) + 1)).append(notebutton);
                            $(".popovernote").popover({
                                container: 'body',
                                html: true
                            });
                        }
					
					if(RegExp("Action Required").test(task[1]) || RegExp("Deferred").test(task[1])){
						
						if(notebutton){
							notebutton  = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"<b>"+$('#td_logistics_'+(parseInt(comment) + 1)+' '+'.action_badge').text()+"</b><br>" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
						}
						
						var dropDownMenu = "<div class=\"clearfix actionrequired\"><div class=\"td_action\"><div class=\"dropdown float-left\"><button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-danger btn-xs dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Action Required <\/button><div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-success btn-xs action\" style=\"width:100%\">Completed<\/button>\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-warning btn-xs action\"style=\"width:100%\">Deferred to next shift<\/button>\n<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-primary btn-xs action\"style=\"width:100%\">No action Required<\/button>	<\/div>\n <\/div><input type=\"hidden\" id=\"action_select\" name=\"logistics_task_" + (parseInt(comment) + 1) + "_action\" required ><\/div> <div class=\"float-left actionUser\"><\/div><div class=\"float-left additionalNote\"><\/div>"+notebutton+"<\/div>"
						
						var rowNum = $("#logistics_table tbody tr").length;
						var row = "<tr  style=\"background-color:#5a7c030f;\"><td>"+rowNum+"</td><td id=\"actionfromLastHandover_logistics_"+(parseInt(comment) + 1)+"\">"+dropDownMenu+ task[0]+"<\/td><td></td><td></td><\/tr>"
						 $(row).insertBefore($("#logistics_table #addButton"));
					}                

            }

			for (comment in lastHandover['Other Comments']) {
                var task = lastHandover['Other Comments'][comment];
                var taskRow = "<tr><td style=\"width:5%;\">" + (parseInt(comment) + 1) + "<\/td><td id='td_comments_" + (parseInt(comment) + 1)+ "' style=\"width:95%;\"><\/td><\/tr>"
				
                $("#handover_comments tbody").append(taskRow);
                var note = "";
                
				var actionLabel ="<span class=\"badge badge-danger\">Action  Required </span><br>";

                    //check if the task is new or deferred
					if (RegExp("Completed").test(task[1])) {
                        note = "<span class=\"badge badge-primary\"><strong>Action from last Shift:<\/strong>"+ "   "  +" </span><span class=\"badge badge-success action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_comments_task_" + (parseInt(comment) + 1) + "\"></span><br>";
						actionLabel ="";
						
					} 
					else if (RegExp("Deferred").test(task[1])) {
                         note = "<span class=\"badge badge-primary\"><strong>Action from last Shift:<\/strong>"+ "   "  +" </span><span class=\"badge badge-warning action_badge\">" + task[1] + "<\/span><span id=\"btn_view_note_comments_task_" + (parseInt(comment) + 1) + "\"></span><br>";
						 
                        if (!RegExp("Deferred to next").test(task[1]) && !RegExp("Deferred action from").test(task[1])){
						actionLabel ="";
						}
						
					}else if(!RegExp("Action Required").test(task[1])){
						actionLabel ="";
					}
					$("#td_comments_" + (parseInt(comment) + 1)).append(note); 
					$("#td_comments_" + (parseInt(comment) + 1)).append(actionLabel + task[0]);
                        
						// check if there is deferred note to task if true add popover note
						var notebutton="";

                    if (!(typeof task[2] === 'undefined') && task[2].trim() !="") {
                            var notebutton = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
                            
							$("#btn_view_note_comments_task_" + (parseInt(comment) + 1)).append(notebutton);
                        }
						
					if(RegExp("Action Required").test(task[1]) || RegExp("Deferred").test(task[1])){
						if(notebutton){
							notebutton  = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\" data-placement= \"bottom\" title=\"Action History\" data-trigger=\"focus\"  data-content=\"<b>"+$('#td_comments_'+(parseInt(comment) + 1)+' '+'.action_badge').text()+"</b><br>" + task[2] + "\"><i class=\"fa fa-comment\"><\/i><\/button>";
						}
						
						var dropDownMenu = "<div class=\"clearfix actionrequired\"><div class=\"td_action\"><div class=\"dropdown float-left\"><button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-danger btn-xs dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Action Required <\/button><div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-success btn-xs action\" style=\"width:100%\">Completed<\/button>\n					<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-warning btn-xs action\"style=\"width:100%\">Deferred to next shift<\/button>\n<button type=\"button\"	 onclick=\"false\" class=\"btn btn-outline-primary btn-xs action\"style=\"width:100%\">No action Required<\/button>					<\/div>\n <\/div><input type=\"hidden\" id=\"action_select\" name=\"comments_task_" + (parseInt(comment) + 1) + "_action\" required ><\/div> <div class=\"float-left actionUser\"><\/div><div class=\"float-left additionalNote\"><\/div>"+notebutton+"<\/div>"
						
						var rowNum = $("#comments_table tbody tr").length;
						var row = "<tr  style=\"background-color:#5a7c030f;\"><td>"+rowNum+"</td><td id=\"actionfromLastHandover_comments_"+(parseInt(comment) + 1)+"\">"+dropDownMenu+ task[0]+"<\/td><td></td><td></td><\/tr>"
						$(row).insertBefore($("#comments_table #addButton"));
					}	

            }
			$(".popovernote").popover({
					container: '.content',
					html: true
				});
			
			
			var page=$('.newhandover').html()
			localStorage.setItem('resetPage',page);			
        });
		
	}
	
	$('#datetimepicker1').datetimepicker({
        format: 'DD-MMM HH:mm',
		sideBySide:true,
		defaultDate:"",
    });
	 
	
	formatDateTimePicker('datetimepicker1');
	formatDateTimePicker('datetimepicker_e_1');
	formatDateTimePicker('datetimepicker_s_1');
	
  

    $(document).on("click", ".btn_addnote", function() {
		if( $(".popover").length != 0){
			return;
		}

		var taskId = ($(this).closest('td').attr('id')).substring(23, $(this).closest('td').attr('id').length);
		
		var popovernote = $(this).closest('td').find('.popovernote');
		
		$(this).html("Save Note");
		
		if (popovernote.length != 0){
			popovernote.popover("show");
			
			var noteinput = $("#"+taskId+"_noteId")

			if(noteinput.length == 0){	
				noteinput = "<div class=\"noteinput\"><textarea class=\"form-control task_note\"  style =\"resize: vertical;\"  name=\"task_note\" id=\""+taskId+"_noteId\" ><\/textarea><\/div>";
					popovernote.attr('data-content',noteinput+popovernote.attr('data-content'));
					popovernote.popover("show");
				}
				
	
		}else{

			noteinput='<div class=\'noteinput\'><textarea class=\'form-control task_note\'  style =\'resize: vertical;\' name=\'task_note\' id=\''+taskId+'_noteId\'><\/textarea><\/div>'
			
			notebutton  = "<button class=\"btn btn-link popovernote\" data-toggle=\"popover\"  title=\"Action History\" data-trigger=\"focus\"  data-content=\""+ noteinput+ "\"><i class=\"fa fa-comment\"><\/i><\/button>";
			
			$(this).closest(".actionrequired").append(notebutton);
			$(".popovernote").popover({
                                container: '.content',
                                html: true
            });
			
			popovernote = $(this).closest('td').find('.popovernote');
			popovernote.popover("show");
			

		}
			var scroll = $(window).scrollTop()
			$("#"+taskId+"_noteId").focus();
			window.scrollTo(0,scroll);		
    });
	
	$(document).on( "blur",".task_note",function(){
		var note =  $(this).val()
		//console.log($(this).attr("id"));
		var id = $(this).attr("id").substring(0, ($(this).attr('id').length-7))
		var targetId = "actionfromLastHandover_"+id;
		var popovernote = $("#"+targetId).find(".popovernote")
		var addButton = $("#"+targetId).find(".btn_addnote")
		
		if(note ==""){
			popovernote.attr('data-content', (popovernote.attr('data-content')).replace(/<div(.|\n|\r)+div>/g,""));
			addButton.html("Add Note");
		}
		else{
			noteinput='<div class=\'noteinput\'><textarea class=\'form-control task_note\'  style =\'resize: vertical;\' name=\'task_note\' id=\''+$(this).attr("id")+'\'>'+note+'<\/textarea><\/div>'
			popovernote.attr('data-content', (popovernote.attr('data-content')).replace(/<div(.|\n|\r)+div>/g,noteinput));
			addButton.html("Edit Note");
		}
		
		 popovernote.popover("hide");

		if(popovernote.attr('data-content')+note==""){	
			popovernote.remove();
			addButton.html("Add Note");
		}
	
	} )
	actionDropDowns();
	
function actionDropDowns(){
	$(document).on("click", ".dropdown-menu button,.dropdown-item", function() {
	

                var dropdown_button = $(this).closest('.dropdown').children(":first");
                dropdown_button.text($(this).text())
				
				if( $(this).closest('.dropdown').attr("id")=="month"){
					return
				}

                var dropdownValueField = $(this).closest('.dropdown').nextAll('input[type="hidden"]:first')
                var id = ($(this).closest('td').attr('id')).substring(23, $(this).closest('td').attr('id').length);

                dropdownValueField.val($(this).text());

                $(this).closest('.td_action').nextAll(".dueToChooser").remove();

                var dueToChooser = $("<div class=\"dueToChooser float-left\"><div class=\"dropdown\" style =\"display: inline-block !important;\">\n  <button class=\"btn btn-outline-danger btn-xs dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">Select Reason<\/button>\n  <div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">\n    <a class=\"dropdown-item\" id=\"arn\">Aircraft No Show <\/a>\n    <a class=\"dropdown-item\" id=\"cph\">Task no longer applicable<\/a>\n <\/div>\n<\/div><input id=\"action_select_reason\" type=\"hidden\" name=\"" + id + "_station\" required ><\/div>");
				
				 dropdown_button.removeClass(" btn-outline-danger").addClass('btn-outline-success');
				 
                switch ($(this).text()) {
                    case "Completed":
                    case "Deferred to next shift":

                        //////console.log($(this).closest('.td_action'));
                        $(this).closest('.td_action').nextAll(".actionUser:first").empty().append("<div class=\"autocomplete\"><input type=\"text\" id=\"staff_name_"+id+"\"  class=\"form-control\" name=\"action_staff_name_" + id + "\" placeholder=\"Performed by \"></div>").children().focus();

                        $(this).closest('.td_action').nextAll(".additionalNote:first").empty().append("<i class=\"btn btn-xs text-primary fa btn_addnote fa-edit\"> Add Note</i>");
                        //$(this).closest('.dropdown').next();
                        break;

                    case "No action Required":
                        $(this).closest('.td_action').after(dueToChooser);
                        $(this).closest('.td_action').nextAll(".actionUser:first").empty();
                        $(this).closest('.td_action').nextAll(".additionalNote:first").empty().append("<i class=\"btn btn-xs text-primary fa btn_addnote fa-edit\"> Add Note</i>");
                        break;
                }
				
				autocomplete('#staff_name_'+id,activeStaff);
            });

}

	//$('#start_time').val(moment().subtract(9,"hours").format('DD/MM/YYYY HH:mm'));

	$(document).on("click", ".toNextShift", function() {
		$(this).closest('div').parent().find('input').first().val("Continued to Next Shift")	
	})
	$(document).on("click", ".fromLastShift", function() {
		$(this).closest('div').parent().find('input').first().val("Continued from Last Shift")	
	})
	
	
    $(document).on("click", "input[type=checkbox]", function() {
        if (this.checked) {
            $(this).val("true");
			$(this).attr("checked","checked")
        } else {
            $(this).val("false");
        }
    });



    $(document).on("click", ".aircraftSelect", function() {
        if (this.checked) {
            var aircraftName = ($(this).closest('label').text().toLowerCase()).trim();
            checkedAircraft(aircraftName, false);


        } else {
            var aircraftName = ($(this).parent().next('th').text().toLowerCase());
            uncheckAircraft(aircraftName);

        }

    });

    //Function to make aircraft div expand on select, disable=true will disable the checkbox & table will be created without row
    function checkedAircraft(aircraftName, disable) {
		 var disable = disable || false;
        var aircraftName = aircraftName.toLowerCase();



        if (!$("div#" + aircraftName).hasClass('workAircraftExpand')) {
            $("div#" + aircraftName).addClass('workAircraftExpand').removeClass('workAircraft');
            var htmldata = "<table class=\"table\" id=\"" + aircraftName + "_table\">\n <thead class=\"thead-light\">\n	<tr >\n <th style=\"width:2%\"><input class=\"aircraftSelect\" id=\"checkbox_" + aircraftName + "\" type=\"checkbox\" checked=\"checked\" /><\/th>\n<th class=\"text-center\">" + aircraftName.toUpperCase() + "<\/th>\n <th class=\"text-bottom\" style=\"width:4%\"><\/th>\n<th style=\"width:4%\"><\/th>\n <\/tr>\n	<\/thead>\n	<tbody>\n 				<tr id=\"addButton\">\n					<td><button type=\"button\" class=\"btn btn-link add_Row\" style=\"transform: scale(2);\ onclick=\"false\"><i class=\"fa fa-plus-circle\"><\/i><\/button><\/td>\n	<\/tr>\n			<\/tbody>\n		<\/table>"

            $("div#" + aircraftName).children(':first').replaceWith(htmldata);
			var rowCount = parseInt($("#"+ aircraftName + "_table tbody").find('tr').length);
		
        }
        if (disable == true) {
            $("input#checkbox_" + aircraftName).attr("disabled", true);
        } else {
            var tablerow = $("<tr>\n<td>"+rowCount+"<\/td>\n					<td><div class=\"form-group\"><textarea class=\"form-control\"  style =\"resize: vertical;\" id=\"" + aircraftName + "_task_"+rowCount+"\" name=\"" + aircraftName + "_task_"+rowCount+"\" required><\/textarea><\/div><\/td>\n <td class=\"text-center nopadding\" ><span class=\"small\">Action Required.<br><\/span> <input type=\"checkbox\" id=\"" + aircraftName + "_task_"+rowCount+"_check\" name=\"" + aircraftName + "_task_"+rowCount+"_check\"  value =\"false\"\/><\/td>\n<td><button class=\"btn btn-link \"><\/button><\/td>\n<\/tr>\n<\/tr>\n")
            
			tablerow.insertBefore($("#" + aircraftName + " #addButton"));
			
			$("#" + aircraftName + " #addButton").prev().children().find('textarea').focus();
        }


    }

    function uncheckAircraft(aircraftName) {
	
		

        $("div#" + aircraftName).addClass('workAircraft').removeClass('workAircraftExpand');
		
		if(aircraftName.legth ==3 ){
			aircraftNamea=aircraftName.toUpperCase()
		}
		else{
		 aircraftNamea = aircraftName.charAt(0).toUpperCase() + aircraftName.slice(1)
		}
		
        var htmldata = "<label><input class=\"aircraftSelect\" type=\"checkbox\" \/ id=\"expanded\"> " + aircraftNamea + "<\/label>"
        
		$("div#" + aircraftName).children(':first').replaceWith(htmldata);

    }


    $(document).on("click", ".add_Row", function() {
        var table = ($(this).closest('.card').children(":first").text().toLowerCase().trim());
			console.log(table);
        var id;
		var rowCount = parseInt($(this).closest('tbody').find('tr').length);
        switch (table) {
            case "work performed on cityjet fleet":
			case "work performed on nordica and other fleet":
                var aircraftName = ($(this).closest('table').find("th").next().html().toLowerCase().trim());
                id = aircraftName + "_task_"+rowCount;
                break;


            case "logistics comment":
                //////console.log(table);
                id = "logistics_task_"+rowCount;
                break;

            case "other comment":
                id = "comments_task_"+rowCount;
                break;
			
			case "van inventory count performed by":
                id = "findings_task_"+rowCount;
                break;

            case "staff":				
				var row = "<tr><td><div class=\"form-inline autocomplete\"><div class=\"autocomplete float-left\" style=\"width: 39%;\"><input placeholder=\"Staff Name\" type=\"text\" id=\"n_staff_"+rowCount+"\" class=\"form-control\" name=\"n_staff_name_"+rowCount+"\" required=\"\" style=\"width: 100%;\"></div><div class=\"input-group date float-left\" id=\"datetimepicker_s_"+rowCount+"\" data-target-input=\"nearest\" style=\"margin-left: 0.1rem;width: 30%;\"><input placeholder=\"Start Time\" id=\"n_staff_"+rowCount+"_s\"type=\"text\" 	class=\"form-control datetimepicker-input \" data-target=\"#datetimepicker_s_"+rowCount+"\" value=\"\"><div class=\"input-group-append\" data-target=\"#datetimepicker_s_"+rowCount+"\" data-toggle=\"datetimepicker\"><div class=\"input-group-text\"><i class=\"far fa-clock\"><\/i><\/div><\/div><\/div>\r\n<div class=\"input-group date float-left\" id=\"datetimepicker_e_"+rowCount+"\" data-target-input=\"nearest\" style=\"margin-left: 0.1rem;width: 30%;\"><input placeholder=\"End Time\" id=\"n_staff_"+rowCount+"_e\"type=\"text\" class=\"form-control datetimepicker-input\" data-target=\"#datetimepicker_e_"+rowCount+"\" value=\"\"><div class=\"input-group-append\" data-target=\"#datetimepicker_e_"+rowCount+"\" data-toggle=\"datetimepicker\"><div class=\"input-group-text\"><i class=\"far fa-clock\"><\/i><\/div><\/div><\/div>\r\n<\/div><\/td><td style=\"width:6%\"><button type=\"button\" class=\"btn btn-link delete_Row\" style=\"transform: scale(1.5); \" onclick=\"false\"><i class=\"fa fa-trash\"><\/i><\/button><\/td> <\/tr>"
        }

		

        if (table == "staff") {
            htmldata = row;
			$(this).closest('tr').before(htmldata);
			$(this).closest('tr').prev().children().find('input').first().focus();
			formatDateTimePicker('datetimepicker_e_'+rowCount);
			formatDateTimePicker('datetimepicker_s_'+rowCount);
			autocomplete('#n_staff_'+rowCount,activeStaff);
			
			

        } else {
            var htmldata = "<tr >\n<td style=\"width:2%\">" + (rowCount) + "<\/td>\n <td><div class=\"form-group\"><textarea id=\""+id+"\"class=\"form-control\"  style =\"resize: vertical;\" name=\"" + id + "\" required><\/textarea><\/div><\/td>\n <td style=\"width:4%\" class=\"text-center nopadding\" ><span class=\"small\">Action Required.<br><\/span> <input type=\"checkbox\" id=\"" + id + "_check\" name=\"" + id + "_check\" value=\"false\"\/><\/td>\n <td style=\" padding: 25px 0 0 0; vertical-align: top;\"><button type=\"button\" class=\"btn btn-link delete_Row\" style=\"transform: scale(1.5);\" onclick=\"false\"><i class=\"fa fa-trash\"><\/i><\/button><\/td>\n	<\/tr>"
			
			
			
			$(this).closest('tr').before(htmldata);
			$(this).closest('tr').prev().children().find('textarea').focus();
		}
		
        
    });

    $(document).on("click", ".delete_Row", function() {
        $(this).closest('tr').remove();
    });


    function stationAbbr(station) {
		var abbr = abbr || true
        switch (station.toLowerCase()) {

            case "arlanda":
                if (abbr === true) {
                    return "ARN"
                }
            case "arn":
                return "Arlanda";

            case "oslo":
                if (abbr === true) {
                    return "OSL"
                }
            case "osl":
                return "Oslo";

            case "trondheim":
                if (abbr === true) {
                    return "TRD"
                }
            case "trd":
                return "Trondheim";

            case "helsinki":
                if (abbr === true) {
                    return "HEL"
                }

            case "hel":
                return "Helsinki";

            case "tallinn":
                if (abbr === true) {
                    return "TLL"
                }
            case "tll":
                return "Tallinn";

            case "copenhagen":
                if (abbr === true) {
                    return "CPH"
                }
			
			case "gev":
                return "Gallivare";
			case "gallivare":
			 if (abbr === true) {
                    return "GEV"
                }
            case "cph":
                return "Copenhagen";
			
			case "test":
                return "TEST STATION";
			
			

        }

    }


    function setHandoverData() {
		var insertToAnotherStation = {};
        data = {};

        data['Station'] = station;

        var staffs = new Array();
        $("input[name^='n_staff_name']").each(function() {
			var stId =$(this).attr('id')
			var staffShiftRecord = {}
			staffShiftRecord['name']= ($(this).val().trim());
			staffShiftRecord['startTime']=$('#'+stId+'_s').val();
			staffShiftRecord['endTime']=$('#'+stId+'_e').val();
			
			staffs.push(staffShiftRecord); 
        });
        data['Staff'] = staffs;

        var starttime = $("#start_time").val();
        data['Start Time'] = starttime;
        data['End Time'] = moment().format('DD-MMM HH:mm');
		data['Inventory Performed By'] =$("#n_staff_inv").val();

        var workperformed = {};
        var logisticsnote = new Array();
        var othercomments = new Array();


        $(".newhandover .workAircraftExpand").each(function() {
			
			var aircraftName = $(this).attr('id').toLowerCase();
            var task = new Array();
		
			$('td[id^=actionfromLastHandover_'+ aircraftName + ']').each(function() {
				var taskPerformed = new Array();				
				var byuser = ""; 
				if($(this).find('input[name^="action_staff_name"]').val()!=""){
					 byuser+=" by " + $(this).find('input[name^="action_staff_name"]').val();
				}
				
				var actionPerformed = $(this).find('input[id=action_select]').val();

				taskPerformed[0] = $(this).clone().find(".actionrequired").remove().end().text();
				taskPerformed[1] = actionPerformed + byuser + " " + moment().format('DD-MMM HH:mm');
				
				var noteID= ($(this).attr('id')).replace("actionfromLastHandover","td");
				var actiontitle = $("#"+noteID).find(".action_badge").html();
				
				var note =  $(this).find('.popovernote').attr('data-content') || "";
				var newNote = note.match(/(?<=noteId'>).*(?=<\/textarea>)/gm)||"";

				note = newNote +  note.replace(/<div(.|\n|\r)+div>/g,"");
				
				taskPerformed[2] = note;
				
				task.push(taskPerformed);
				if (RegExp("No action Required").test(actionPerformed)) {
					var reason= $(this).find('input[id=action_select_reason]').val()
					taskPerformed[1] = actionPerformed+ " due to "+ reason;
				}
				
			});		
			
			
            $("textarea[id ^='" + aircraftName + "_task_']").each(function() {
                var taskPerformed = new Array();

                var action = "";
                var check = $(this).closest("td").next().children("input").val()
                if (check == "true") {
                    action = "Action Required"
                }
                taskPerformed[0] = $(this).val().trim();
                taskPerformed[1] = action.trim();
                task.push(taskPerformed);
            });
			
			if(aircraftName!="logistics" && aircraftName!="comments" && aircraftName!="findings"){
				workperformed[aircraftName.toUpperCase()] = task;
			}
			
			else if(aircraftName =="comments"){
				data["Other Comments"]=task;
			}
			else if(aircraftName =="logistics"){
				data["Logistics Comments"]=task;
			}
			else if(aircraftName =="findings"){
				data["Inventory Findings"]=task;
			}
        });
        data['Work Performed On'] = workperformed;
        
		var newData={}
		newData['newrow']=data;
		newData['updateToStations']=insertToAnotherStation;
		
		console.log(newData);
		return newData;
    }					
	
	$(document).on("click", ".BackHandoverBtn", function() {
		$(".BackHandoverBtn").hide();
		$(".SaveHandoverBtn").hide();
		$(".ResetHandoverBtn").hide();
		$(".NewHandoverBtn").html(" Continue  " +"<i class=\"fa fa-chevron-right\" aria-hidden=\"true\"></i>").show();
        $(".viewhandover").show();
		$(".newhandover").hide();

		$('html,body').animate({
            scrollTop: 0
            }, 100);
			

    });
	
	$(document).on("click", ".SaveHandoverBtn", function() {
			saveData(station);

    });

    $(document).on("click",".NewHandoverBtn",function(event) {
        event.preventDefault();	
			$(".menubar").show()
			$(".NewHandoverBtn").hide();
			$(".BackHandoverBtn").show();
			$(".ResetHandoverBtn").show();
			$(".SaveHandoverBtn").show();
        	$(".viewhandover").hide();
        	$(".newhandover").show();
        	$('html,body').animate({
            scrollTop: 0
        	}, 700);
        
       

        
    });
	
	$(document).on("click",".ResetHandoverBtn",function(event) {
				var resetPage = localStorage.getItem("resetPage")
		
		$('.newhandover').empty().append(resetPage);
		$(".popovernote").popover({
					container: '.content',
					html: true
		});

		$('input[name^="n_staff_name"]').each(function(i, obj) {
			autocomplete("#"+$(obj).attr("id"),activeStaff);
		});
		
		$('div[id^="datetimepicker"]').each(function(i, obj) {
			formatDateTimePicker($(obj).attr("id"));
		});
		
	});
	$(document).on("click",".resetStation",function(event) {
        event.preventDefault();
		if(browser !=="ie"){
			localStorage.setItem("station","");
		}
		location.reload();

	});
	
	$(document).on("click",".browseTimeSheets",function(event) {
		 if(activeStaff =="" ){
				$.getJSON(sendTo + "?callback=?", {
				method: "getStaffList",
				},

				
					function(data) {
						activeStaff = data
						autocomplete("#search_name",activeStaff);
					});
			}
		
		event.preventDefault();
		$(".menubar").hide();
		$(".searchBar").show();
		$(".searchBar_button").show();
		$(".handoverHome").show();
		for(i=0;i<4;i++){
			$('.month').find(".dropdown-menu").append('<a class="dropdown-item" >'+moment().subtract(i, 'months').format('MMM YYYY')+'</a>');
		}
		
		
		$(".searchBar").find(".searchInfo").remove();
		$(".searchBar").append("<span class='badge badge-warning float-right searchInfo'> Time Sheet Browser</span>")
		$(".main").hide();
		$(".dataBrowser").empty();
		$(".dataBrowser").append("<span style='color:blue'>Contact station supervisor or helsinki planner if you do not have pin to access your timesheet </span>");
		$(".dataBrowser").show();
	});
	
	$(document).on("click",".browseHandover",function(event) {
		event.preventDefault();
		$(".handoverHome").show();
		$(".searchBar").show();
		$(".menubar").hide();
		$(".searchBar_button").hide()
		$(".searchBar").find(".searchInfo").remove();
		$(".searchBar").append("<span class='badge badge-warning float-right searchInfo'> Handover History</span>");
		$(".main").hide();
		$(".dataBrowser").empty();
		$.getJSON(sendTo + "?callback=?", {
            method: "getAllHandover",
        },function(data){
			$(".loader").hide();
			
			$(".dataBrowser").append("<table class='history_table  table table-sm table-bordered .table-condensed' id='th_table'><thead><tr><th>Date</th><th>Station</th><th>Shift </th></tr></thead><tbody></tbody></table>");
			
			
			for(var i =0;i < data.length;i++){
			
				if (i % 2 == 0){
					var style = "background:#f0f8ff;"
				}else{
					var style="";
				
				}
				var j=0;
				for(var station in data[i]['Station']){
					row = '<tr style='+style+'>'
					if(j==0){
						
						row =row +'<td style="vertical-align:middle;" rowspan='+Object.keys(data[i]['Station']).length+'>'+data[i]['Date']+'</td>'
					}
					row=row + '<td>'+station+'</td><td>'
					for (k in data[i]['Station'][station]){
						row=row+"<button class='btn btn-link btn-xs getHandover' value='"+data[i]['Station'][station][k][1]+"' data-toggle='modal' data-target='.bd-example-modal-lg'>"+data[i]['Station'][station][k][0]+"</button>"
					}
					
					row =row +"</td></tr>"
					j=j+1;
					$('.history_table tbody').append(row);
				}
				
			
			}
		
		});
		
		
		
		$(".dataBrowser").show();
	
	
	});
	
	$(document).on("click",".handoverHome",function(event) {
		event.preventDefault();
		$(".dataBrowser").empty();
		$(".menubar").show();
		$(".searchBar").hide();
		$(".handoverHome").hide();
		$(".main").show();
	});
	
	
	$(document).on("click",".help",function(event) {
		event.preventDefault();
		$(".handoverHome").show();
		$(".searchBar").show();
		$(".menubar").hide();
		$(".searchBar_button").hide()
		$(".searchBar").find(".searchInfo").remove();
		$(".searchBar").append("<span class='badge badge-warning float-right searchInfo'> Instructions to use</span>");
		$(".main").hide();
		$(".dataBrowser").empty();
		$(".dataBrowser").append('<iframe src='+ inst_Link +' width="100%" height="800px"></iframe>');
		$(".dataBrowser").show();
	});
	
	$(document).on("click",".getPin",function(event){
		$("#search_name").removeClass("error");
		$(".dataBrowser").empty();
		$(".month").removeClass("error");
		$("#pin").removeClass("error");
		var masterpin=$("#pin").val();
		var error =""
		
		var staff=$('#search_name').val();
		if(staff=="" || activeStaff.indexOf(staff) === -1 ){
			error ="Please select staff name from list"
			$(".dataBrowser").append("<span style='color:red'>"+error +"</span><br>");
			$("#search_name").addClass("error");
		}
		
		if(pin=="" || masterpin.length != 6){
		//console.log(pin.length);
			error ="Please enter valid Master Pin"
			$(".dataBrowser").append("<span style='color:red'>"+error +"</span><br>");
			$("#pin").addClass("error");
		}
		if(error!=""){
			return
		}
		$(".loader").show();
		
		$.getJSON(sendTo + "?callback=?", {
            method: "getPin",
            staff: staff,
			pin:masterpin,
        },function(data){
			$(".loader").hide();
			if(data[0]=="Pin Mismatch"){
				$(".dataBrowser").append("<div class='alert alert-danger'>Master Pin could not be verified, contact helsinki planner for assistance</div>");
				return;
			}
			//console.log(data);
			$(".dataBrowser").append("<div style='width:100%;text-align:center'><h1><span style='color:red'>"+data[0] +"</span></h1></div>");
			
		
		});
		
		
		
	
	});
	$(document).on("click",".ts_print",function(event){
		var printContents = $(".content").clone();
            var myWindow = window.open( '', "Time sheet ", "menubar=0,location=0,height=700,width=700" );
            
			$(printContents).prepend('<head><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous" /></head>');

            $(printContents).find(".searchBar").hide();
			$(printContents).find(".top-navbar").hide();
			$(printContents).find(".searchBar").hide();
			$(printContents).find(".ts_print").hide();
			$(printContents).find(".title").html('<b>Staff: </b>'+ $('#search_name').val()+ "<b> Month: </b>"+$(".month").find("button").text());
			$(printContents).find(".table").addClass("table-sm").css("fontsize","x-small");
			$(printContents).appendTo( myWindow.document.body );;
			
			$(printContents).find("button").each(function(){
			 $(this).closest("td").empty().append($(this).text());
			
			})
			
			
			var fakeListener = setInterval(function(){
			if($(printContents).find(".table").css("border-collapse")=== "collapse"){
				clearInterval(fakeListener)
				myWindow.print();
				myWindow.close();
				}
			},50)
			
			
			
			
	
	});
	
	
	$(document).on("click",".search",function(event){
		event.preventDefault();
		
		$("#search_name").removeClass("error");
		$(".month").removeClass("error");
		$("#pin").removeClass("error");
		$(".dataBrowser").empty();
		var pin=$("#pin").val();
		var error =""
		var month= $(".month").find("button").text();

		var staff=$('#search_name').val();
		if(staff=="" || activeStaff.indexOf(staff) === -1 ){
			error ="Please select staff name from list"
			$(".dataBrowser").append("<span style='color:red'>"+error +"</span><br>");
			$("#search_name").addClass("error");
		}
		
		if(pin=="" ){
			error ="Please enter Pin"
			$(".dataBrowser").append("<span style='color:red'>"+error +"</span><br>");
			$("#pin").addClass("error");
		}
		
		
		if(month.trim()=="Select Month"){
			error ="Please select a Month"
			$(".dataBrowser").append("<span style='color:red'>"+error +"</span><br>");
			$(".month").addClass("error");
		}
		
		
		if(error!=""){
			return
		}
		$(".loader").show();
		

		$.getJSON(sendTo + "?callback=?", {
            method: "getTimeSheet",
            staff: staff,
			pin:pin,
			month: month.split(" ")[0],
        },function(data){
			$(".loader").hide();
			if(data[0]=="Pin Mismatch"){
				$(".dataBrowser").append("<div class='alert alert-danger'>Pin Mismatch, contact station supervisor or helsinki planner for correct Pin</div>");
				return;
			}
			var monthNum = new Date(Date.parse(month.split(" ")[0] +" 0",month.split(" ")[1])).getMonth();	
			var daysInMonth = new Date(month.split(" ")[1], (monthNum + 1), 0).getDate();
			
			if(data.length==0){
				$(".dataBrowser").append("<div class='alert alert-danger'>Oops! Could not find anything for " + staff+ " on  "+ month +"</div>");
			}
			else{
				
				$(".dataBrowser").append("<div class='alert alert-warning'>Disclaimer: The timesheet is automatically generated based on the data from Shift Handovers<br>This cannot be considered as official proof of working hours.</div>");
				$(".dataBrowser").append("<table class='timesheet_table  table table-striped table-bordered .table-condensed' id='ts_table'><thead><tr><th>Date</th><th>Shift/Handover File</th><th>Start Time</th><th>End TIme</th><th>Station</th><th>Total Hours <button class='btn btn-link btn-xs float-right ts_print'> <i class='fas fa-print'> Print</i></button></th></tr></thead><tbody></tbody></table>");
				
				var days = ['<span style="color:red">Sun</span>', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', '<span style="color:red">Sat</span>'];
				
				for(var i = 1; i<=daysInMonth;i++){
					var day = (new Date(month.split(" ")[1],monthNum,i)).getDay();
					$('.timesheet_table tbody').append("<tr><td id='day_"+i+"'>"+i+"   "+days[day]+"</td><td id='shift_"+i+"'></td><td id='starttime_"+i+"'></td><td id='endtime_"+i+"'></td><td id='station_"+i+"'></td><td id='totalh_"+i+"'></td></tr>")
				}
				
				var actualStartTime="";
				var dayRowNo="";
				for (var i=data.length-1;i>=0;i--){
				
					var startDateTime = data[i][1];
					var endDateTime = data[i][2];
					if(startDateTime !="Continued from Last Shift"){
						actualStartTime = moment(startDateTime);
						dayRowNo = actualStartTime.date();					
					
					if(endDateTime !="Continued to Next Shift"){
			
						$("#starttime_"+dayRowNo).append("<div>"+actualStartTime.format("HH:mm")+"</div>");
						$("#endtime_"+dayRowNo).append("<div>"+moment(endDateTime).format("HH:mm")+"</div>");
						$("#totalh_"+dayRowNo).append("<div>"+Math.round(moment.duration(moment(endDateTime).diff(actualStartTime)).asHours() * 100) / 100+"</div>");
						
						$("#shift_"+dayRowNo).append("<div><button class='btn btn-link btn-xs getHandover' value='"+data[i][4]+"' data-toggle='modal' data-target='.bd-example-modal-lg'>"+data[i][0]+"</button></div>");
						
						
						if(!RegExp(data[i][3]).test($("#station_"+dayRowNo).text())){
							$("#station_"+dayRowNo).append("<div>"+data[i][3]+"</div>")
							//console.log($("#station_"+dayRowNo).text());
						}
						actualStartTime="";
						dayRowNo="";
					}else{

						$("#starttime_"+dayRowNo).append("<div>"+actualStartTime.format("HH:mm")+"</div>");
						
						$("#shift_"+dayRowNo).append("<div><button class='btn btn-link btn-xs getHandover' value='"+data[i][3]+"' data-toggle='modal' data-target='.bd-example-modal-lg'>"+data[i][0]+"/button></div>");
						
						if(!RegExp(data[i][3]).test($("#station_"+dayRowNo).text())){
							$("#station_"+dayRowNo).append("<div>"+data[i][3]+"</div>")
							//console.log($("#station_"+dayRowNo).text());
						}
					}	
				}else{

					
					if(endDateTime !="Continued to Next Shift"){
						$("#endtime_"+dayRowNo).append("<div>"+moment(endDateTime).format("HH:mm")+"</div>");
						$("#shift_"+dayRowNo).append("<div><button class='btn btn-link btn-xs getHandover' value='"+data[i][4]+"' data-toggle='modal' data-target='.bd-example-modal-lg'>"+data[i][0]+"</button></div>");
						
						
						
						
						$("#totalh_"+dayRowNo).append("<div>"+Math.round(moment.duration(moment(endDateTime).diff(actualStartTime)).asHours() * 100) / 100+"</div>");
						if(!RegExp(data[i][2]).test($("#station_"+dayRowNo).text())){
							$("#station_"+dayRowNo).append("<div>"+data[i][3]+"</div>")
							//console.log($("#station_"+dayRowNo).text());
						}
					
					}else{
						$("#starttime_"+dayRowNo).html("<div>"+actualStartTime.format("HH:mm")+"</div>");
						
						$("#shift_"+dayRowNo).append("<div><button class='btn btn-link btn-xs getHandover' value='"+data[i][4]+"' data-toggle='modal' data-target='.bd-example-modal-lg'>"+data[i][0]+"</button></div>");
						
						
						if(!RegExp(data[i][2]).test($("#station_"+dayRowNo).text())){
							$("#station_"+dayRowNo).append("<div>"+data[i][3]+"</div>")
							//console.log($("#station_"+dayRowNo).text());
						}
					}
				}
			}
			}
		})
	
	
	
	
	
	})
	
	$(document).on("click",".getHandover",function(event){
			$('#testmodel').modal();
			$('.handoverViewer').empty()
			$('.handoverViewer').append($('.loader').clone());
			$('.handoverViewer .loader' ).show();
			var handoverId =$(this).val();
			
			$.getJSON(sendTo + "?callback=?", {
                method: "getHandoverById",
                handoverId: handoverId
				},
				function(data) {
					//console.log(data);
					$('.handoverViewer').empty();
					$('.handoverViewer').append(data);
			})
	
	
	});
	
	$(document).on("click",".closeAlert",function(event) {
        $(this).closest(".successAlert").remove();
		window.print();
		location.reload();
	});

    $(document).on("click",".newhandoverSubmit",function(event) {
        event.preventDefault();	
		if(validateInputs("newhandover")){
				var data = setHandoverData();
				$('#loading_text').text("Updating new Handover");
				$('.main').hide();
				$('.loader').show();
				console.log(data['newrow']);
			   $.getJSON(sendTo + "?callback=?", {
                method: "update",
                newrow: JSON.stringify(data['newrow']),
                updateToStations: JSON.stringify(data['updateToStations'])
				
            },

            function(data) {
			
				//console.log(data);
				$('.menubar').hide();
				$(".preview").append(data['Html']);
				$('#hdiv').empty();
				$(".preview").append("<br/><hr><b>Feedback (if applicable)</b>");
				$(".preview").show();
				$('.loader').hide();
				$('.main').hide();
				$('.top-navbar').hide();
				$("#emailConfirm").html(data['Email Confirm'])
				$(".successAlert").show();
				$(".back").remove();
				
				$(".container").css('margin-left','50px');
				
				
		});
		
		}

    });
	
	var nextRow_enter=true;
	
	$(document).on("keyup","textarea,input[type=text]",function (event) {
		//console.log(event.keyCode +"   "+nextRow_enter);
		var check = $(".autocomplete-items").length;
			if (event.keyCode == 13 && nextRow_enter === true){
					//console.log("next enabled")
					var rowBtn = $(this).closest("tbody").find(".add_Row");
					rowBtn.trigger("click");
				}
					nextRow_enter = true;
					
	});
	
	
	$(document).on("focusout","input[type=text]",function (event) {
					if($(this).attr("id").match(/staff/)){
						
					if(activeStaff.indexOf($(this).val()) === -1) {
						  activeStaff.push($(this).val());
					  }
					}
					
	});
	


	
	function validateInputs(className){
    	var check=true;
    	$('.errormessage').remove();
		$("#n_staff_inv").removeClass("error");
		$("tr").removeClass("error");
    	$('input').each(function(i, obj) {
			var errormessage ="";
			var inputId=$(obj).attr("id");
    		
			if($(obj).val()=="" && $(obj).prop('required')){
    				if(inputId=="action_select_reason"){
    					errormessage ="You must select a reason";
    				}
					if(inputId=="action_select"){
    					errormessage ="You must select an Action";
    				}
					
					if(inputId.match(/^(n_staff_)\d+$/g)!=null){
						errormessage="Please enter staff name"
					}		
    			}
				
			if(inputId=="start_time"){
				var d = moment($(obj).val(), 'DD-MMM HH:mm')
				if(d.isValid()){
					if(d>moment()){
						errormessage="Start time cannot be in future"
					}
					if(d <moment().subtract(24,"hours")){
						errormessage="Start Time cannot be more than 24 hrs ago"
					}
				}else {			
					errormessage="Please enter valid Shift start date time"
				}
			}
			
			if(inputId.match(/(n_staff_)\d+(_s)/g)!=null){
				
				var sd =$(obj).val();
				
				if(sd !="" && sd!="Continued from Last Shift"){
				    sd = moment($(obj).val(), 'DD-MMM HH:mm');
					var differ= moment.duration(moment().diff(sd));
					if(differ.asHours()>24){
						errormessage ="Start Time cannot be more than 24 hrs ago"
					}
					
					if(sd > moment()){
						errormessage ="Start Time cannot be in future"
					}	
				}
			}
					
			if(inputId.match(/(n_staff_)\d+(_e)/g)!=null){
				var sd = moment($(obj).closest(".date").prev().find("input").val(),'DD-MMM HH:mm')
				
				if($(obj).val()!="" && $(obj).val()!="Continued to Next Shift"){
					var ed = moment($(obj).val(), 'DD-MMM HH:mm');
					if(ed > moment()){
						errormessage ="End time cannot be in future"
					}
					
					if(sd.isValid()){
						//console.log(sd);
						if(ed < sd ){
						errormessage ="End time cannot less than Start Time"
						}
					}
					
					else {
						//console.log(moment($('#start_time').val(),'DD-MMM HH:mm' ));
						if(ed < moment($('#start_time').val(),'DD-MMM HH:mm' )){
						errormessage ="End time cannot less than Shift Start Time"
					}
					}
				}
			
			}
			
			if(errormessage!=""){
				$(obj).closest('td').prepend("<span class=\"errormessage row\">"+errormessage+" <\/span>").closest('tr').addClass("error");
				check=false;
			}
			
			if($(obj).val()=="" && inputId=="n_staff_inv"){
    					errormessage ="Please specify who performed the inventory";
						$(obj).closest('.autocomplete').prepend("<span class=\"errormessage row\">"+errormessage+" <\/span>");
						$(obj).addClass("error");
						check=false;
    				}

    	});
		
		$('textarea').each(function(i, obj) {
				var errormessage ="";
				if($(obj).val()=="" && $(obj).prop('required')){
					errormessage ="Please fill in this field";
					if ($(obj).attr("name")=="task_note"){
					 errormessage="Please fill in note";
					}
					$(obj).closest('td').prepend("<span class=\"errormessage errnote row\">"+errormessage+" <\/span>");
					$(obj).addClass("error");
					check=false;
				}
		
		});
		if(!check)
		
		{
		$('.'+className).effect( "bounce", "slow" )
		$( ".error")[0].scrollIntoView();
		}
		
    	return check;
    }
		
		
	function checkCurrentVersion(){
		
		var a = $.getJSON(sendTo + "?callback=?", {
            method: "getVersion",
        },
		
        function(data) {
			test = data['Test Version']
			var latestVersion = data['version'];
			var documentVersion = ($(".version").text()).slice(9);
			if(documentVersion != latestVersion){
				var modelText = data['message'];
				$(".successAlert .modal-title").removeClass("text-success").addClass("text-warning").html("Please Update");
				$(".successAlert .modal-body").empty().append(modelText);
				$(".closeAlert").addClass("versionCheckClose").removeClass("closeAlert");
				$(".versionCheckClose").html("Download");
			
				$(document).on("click",".versionCheckClose",function(){
					window.location.replace(data['location']);
					$(".successAlert .modal-body").empty().append("Handover_v."+latestVersion+" has been downloaded, Please reopen the downloaded file on other tab/window");
					$(".versionCheckClose").hide();
				})
			
				$(".successAlert").show();
			}
			else{
				
				showStationChooser();
			}
		});	
	}
	displayCurrentTime();
	
	function showStationChooser(){
		
		$(".chooseStation").show();
		station=localStorage.getItem("station");
		
		if(station && station !="null" && station!="" ){
					$('#station').html(stationAbbr(station, false)+" <a class=\"resetStation\" href=\"#\" style=\"font-weight:normal\"></a>");
					loadHandoverPage(station);		
		}
		/*testing enabled*/
		if(test==true){
		var testStation= "<div class=\"form-check form-check-inline\"><input class=\"form-check-input\" type=\"radio\" name=\"radioButtonStation\" id=\"inlineRadio3\" value=\"TEST\"><label class=\"form-check-label\" for=\"inlineRadio3\">TEST  <\/label></div>"
			$(".stationselect").append(testStation);
			station ="TEST";
		}
	}
	
	function displayCurrentTime() {
		var currentTime = moment().format("DD/MM/YYYY <br> HH:mm:ss");
		$(".clockTime").html(currentTime);
		var t = setTimeout(displayCurrentTime, 500);
	}
	
	function checkSavedData(Station){
		
		var savedData = localStorage.getItem("savedData")
		/*var reset = localStorage.getItem("reset")*/
		//console.log(savedData)
		if(savedData != "" && savedData != null/* & (reset ==null||reset ==) */){
			var data = JSON.parse(savedData);
			
			if(data['LastHandoverId']!= handoverId){
				localStorage.setItem("savedData","");
				return "";
			}
			return data; 
		}
		return "";
	}
	
	function saveData(Station){
		var toSaveData ={}
		var toSaveValue ={}
		var toSaveHtml =$('.newhandover').html()
		
		var savedValues = {};   	
		$('.newhandover input,textarea').each(function(i, obj) {
			var inputId=$(obj).attr("id");
			toSaveValue[inputId]= $(obj).val()
		});
		toSaveData['LastHandoverId']= handoverId;
		toSaveData['station']=Station;
		toSaveData['htmldata']=toSaveHtml;
		toSaveData['values']=toSaveValue;
		toSaveData['LastHandover']= $('.viewhandover').html();
	
		var save = JSON.stringify(toSaveData);
		
		localStorage.setItem("savedData",save);
		
		var alert = "<div class=\"alert customAlert alert-info alert-dismissible fade show\" role=\"alert\"><strong>Saved!</strong> Note that it is only saved on this computer and will be deleted as handover is submitted.<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>"
		
		$(alert).insertAfter($('.menubar'));
		$('.alert').alert()
		
		var test = localStorage.getItem("savedData");
	}
	
	function formatDateTimePicker(id){
	
	if(id.match(/datetimepicker_s/)){
		$('#'+id).datetimepicker({
			toolbarPlacement:"top",
			sideBySide:true,
			format: 'DD-MMM HH:mm',
			autoClose: true,
			buttons: {
				showClear: true,
			},
			tooltips: {
				clear: 'Select if Continued  from last Shift',
			},
			icons:{
				clear: "btn btn-xs btn-primary fromLastShift "
			}
		})
	}
	
	
	if(id.match(/datetimepicker_e/)){
		
		$('#'+id).datetimepicker({
			toolbarPlacement:"top",
			format: 'DD-MMM HH:mm',
			sideBySide:true,
			autoClose: true,
			defaultDate:"",
			buttons: {
				showClear: true,
			},
			tooltips: {
				clear: 'Select if Continued  to next shift',
			},
			icons:{
				clear: "btn btn-xs btn-primary toNextShift"
			}
		})
	}
	else{
		$('#'+id).datetimepicker({
			format: 'DD-MMM HH:mm',
			sideBySide:true,
			autoClose: true,
			defaultDate:"",
		})
	
	
	
	}
	
	}


	function autocomplete(inp, arr) {
		  /*the autocomplete function takes two arguments,
		  the text field element and an array of possible autocompleted values:*/
		  var currentFocus;
		  /*execute a function when someone writes in the text field:*/
		 
		  $(document).on("input",inp,function(e) {
			  var a, b, i, val = this.value;
			  /*close any already open lists of autocompleted values*/
			  closeAllLists();
			  if (!val) { return false;}
			  currentFocus = -1;
			  /*create a DIV element that will contain the items (values):*/
			  a = document.createElement("DIV");
			  a.setAttribute("id", this.id + "autocomplete-list");
			  a.setAttribute("class", "autocomplete-items");
			  /*append the DIV element as a child of the autocomplete container:*/
			  this.parentNode.appendChild(a);
			  /*for each item in the array...*/
			  for (i = 0; i < arr.length; i++) {
				/*check if the item starts with the same letters as the text field value:*/
				if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
				  /*create a DIV element for each matching element:*/
				  b = document.createElement("DIV");
				 
				  /*make the matching letters bold:*/
				  b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
				  b.innerHTML += arr[i].substr(val.length);
				  /*insert a input field that will hold the current array item's value:*/
				  b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
				  /*execute a function when someone clicks on the item value (DIV element):*/
					 $(b).bind( "click",function(e) {
					  /*insert the value for the autocomplete text field:*/
					  $(inp).val(this.getElementsByTagName("input")[0].value)
					  
					  /*close the list of autocompleted values,
					  (or any other open lists of autocompleted values:*/
					  closeAllLists();
					  
				  });
				  a.appendChild(b);
				}else{
					
				}
			  }
		  });
		  /*execute a function presses a key on the keyboard:*/
		  $(document).on("keydown",inp, function(e) {
			  var x = document.getElementById(this.id + "autocomplete-list");
			  if (x) x = x.getElementsByTagName("div");
			  if (e.keyCode == 40) {
				/*If the arrow DOWN key is pressed,
				increase the currentFocus variable:*/
				currentFocus++;
				/*and and make the current item more visible:*/
				addActive(x);
			  } else if (e.keyCode == 38) { //up
				/*If the arrow UP key is pressed,
				decrease the currentFocus variable:*/
				currentFocus--;
				/*and and make the current item more visible:*/
				addActive(x);
			  } else if (e.keyCode == 13) {
				
				/*If the ENTER key is pressed, prevent the form from being submitted,*/
				e.preventDefault();
				if (currentFocus > -1) {
				  /*and simulate a click on the "active" item:*/
				  if (x){
					nextRow_enter = false;
					x[currentFocus].click();
					//$(inp).val(x[currentFocus].getElementsByTagName("input")[0].value)
					closeAllLists();
					
				  }
				}
			  }
		  });
		  function addActive(x) {
			/*a function to classify an item as "active":*/
			if (!x) return false;
			/*start by removing the "active" class on all items:*/
			removeActive(x);
			if (currentFocus >= x.length) currentFocus = 0;
			if (currentFocus < 0) currentFocus = (x.length - 1);
			/*add class "autocomplete-active":*/
			x[currentFocus].classList.add("autocomplete-active");
		  }
		  function removeActive(x) {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (var i = 0; i < x.length; i++) {
			  x[i].classList.remove("autocomplete-active");
			}
		  }
		  function closeAllLists(elmnt) {
			/*close all autocomplete lists in the document,
			except the one passed as an argument:*/
			var x = document.getElementsByClassName("autocomplete-items");
			for (var i = 0; i < x.length; i++) {
			  if (elmnt != x[i] && elmnt != inp) {
			  x[i].parentNode.removeChild(x[i]);
			}
		  }
		}
		/*execute a function when someone clicks in the document:*/
		 $(document).on("click",inp, function (e) {
			closeAllLists(e.target);
			
		});
}

});
       

</script>
