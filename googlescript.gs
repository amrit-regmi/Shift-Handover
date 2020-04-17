var TESTING = false;
var SHEET_NAME = "Handover";
var SCRIPT_PROP = PropertiesService.getScriptProperties();
var VERSION = "2.02"
var masterPin= "582410";
var DOWNLOADLINK="https://drive.google.com/uc?export=download&id=16YIW9HaeuCRMOz7fmK_zpjxx2xWboWgG";
var css_shifttitle = '"width: 25%; padding: 5px;color: #004085; background-color: #cce5ff; border-color: #b8daff;"'
var css_sdata ='"width: 25%; padding: 5px; border: 1px solid #b8daff;"'
var css_workperforemdedata='"border: 1px solid #b8daff; height: auto; border-bottom: 2px solid #b8daff;"'
var css_sNo = '"border-right: 2.5px solid #1c181f14;padding: 5px 5px 0px;display: inline-flex;text-align: center; width: fit-content; margin-right: 10px;height: 100%; font-weight: bold;"'
var css_data='" width: 96%;    display: inline-flex;    border-top: 0.5px outset #b8daff;    padding: 5px;    text-align: justify;"'
var css_titlerow ='"padding: 5px;color: #004085; background-color: #cce5ff; border-color: #b8daff;"'
var css_seperator= '"display: block;height: 5px;"'
var handoverId;

function doGet(e) {
  
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName(SHEET_NAME);

   if (e.parameters.method == "update") {
    
       var updateToStation = JSON.parse(e.parameter.updateToStations);/*{"CPH":{"Work Performed On":{"FPJ":[{"0":"n/s all satis","1":"Deferred action from undefined by undefined 04/19/2019 09:44 pm","2":"ok<b>Deferred to next shift by alain 03/14/2019 15:33</b><br> -<br><strong>Deferred to next shift by jesse 03/13/2019 08:36</strong><br> -<br><strong>Deferred to next shift 03/11/2019 23:54\n</strong><br>\n"}]}},"TRD":{"Other Comments":[{"0":"Ford requires new relay for windshield wipers, not working at the moment\n","1":"Deferred action from undefined by undefined 04/19/2019 09:44 pm","2":"null<b>Deferred to next shift by alain 03/14/2019 15:33</b><br> -<br><strong>Deferred to next shift by jesse 03/13/2019 08:36</strong><br> -<br><strong>Deferred to next shift 03/11/2019 23:54\n</strong><br>"}]}}*/
       var parsedData= JSON.parse(e.parameters.newrow);/*{"Station":"TEST","Staff":[{"name":"Thierry Isler","startTime":"","endTime":""},{"name":"Johan Gripenlind","startTime":"Continued from Last shift ","endTime":"21:43"},{"name":"New Staff","startTime":"","endTime":""}],"Start Time":"19/04/2019 21:43","End Time":"19/04/2019 21:44","Logistics Comments":[],"Other Comments":[["Ford requires new relay for windshield wipers, not working at the moment\n","Deferred to Another Station TRD by undefined04/19/2019 09:44 pm","null<b>Deferred to next shift by alain 03/14/2019 15:33</b><br> -<br><strong>Deferred to next shift by jesse 03/13/2019 08:36</strong><br> -<br><strong>Deferred to next shift 03/11/2019 23:54\n</strong><br>"]],"Work Performed On":{"FPA":[],"FPJ":[["n/s all satis","Deferred to Another Station CPH by undefined04/19/2019 09:44 pm","ok<b>Deferred to next shift by alain 03/14/2019 15:33</b><br> -<br><strong>Deferred to next shift by jesse 03/13/2019 08:36</strong><br> -<br><strong>Deferred to next shift 03/11/2019 23:54\n</strong><br>\n"]],"FPN":[]}}
       //*/
       
       var staff = parsedData['Staff'];

       var formattedData = formatData(parsedData);
       

       var insertToSheetData = formattedData["insertToSheet"];
       var htmlData = formattedData["htmlData"].replace(/Action Required/gm,"<span style='color:red'><b>Action Required</b></span>");
       
       handoverId = setHandoverId();
       insertToSheetData['Id']= handoverId
       
       updateAnotherStation(updateToStation);
       insertData(insertToSheetData,"Handover");
       setStaffTimes(staff,parsedData,handoverId);
      
      
      
      var fixedEmails = "rit.regmi@gmail.com";
      var inputEmail ="rit.regmi@gmail.com";
      var emailAddresses = fixedEmails+","+ inputEmail;
      
     var emailData ={}
     emailData['Html']= htmlData
     try{
        sendemail("Handover from "+parsedData['Station'] + "  "+getShift(parsedData['Start Time']) + " Shift   "+ (parsedData['Start Time'].split(" "))[0],htmlData,emailAddresses)
        emailData['Email Confirm'] ="Email is  sent automatically to Handover mailing group." 
     }catch(err){
       emailData['Email Confirm'] ="<span style='color: red;font-weight: bold;'>There was error sending Email to Handover mailing group, please take the ScreenShot / Print as PDF the folowing page and forward it to LMC@samco.aero</span>"
       }
      return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(emailData)+")").setMimeType(ContentService.MimeType.JAVASCRIPT);
     
   }

    if (e.parameters.method == "getHandover") {
        var tostation = e.parameter.station;
        return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(getLastHandover(tostation)) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  
  if (e.parameters.method == "getAllHandover") {
        return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(getAllHandovers()) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
  
  if(e.parameters.method =="getHandoverById"){
    var handoverId= e.parameter.handoverId;
    var data = getLastHandover(handoverId);
    var html =getHtml(data);
   
    return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(html) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  if (e.parameters.method == "getVersion") {
    var returnData ={};
    returnData["Test Version"] = TESTING;
    returnData["version"]= VERSION;
    returnData["message"]="Handover has been updated to version "+ VERSION + ",<br /> Changes on this Version:<br />1. Added Daily Van Inventory Check <br />2. Information if Email sending failed.<br />3. Minor Changes on UI<br /><br />Please download the latest version to continue, click ok to download";
    returnData["location"]=DOWNLOADLINK;
    //Logger.log(returnData);
    
        return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(returnData) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
  
  if (e.parameters.method == "getStaffList") {
    var returnData ={};
    //Logger.log(returnData);
    return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(getStaffList()) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
     }
  
   if (e.parameters.method == "getTimeSheet") {
     var staff = e.parameters.staff;
     var pin = e.parameters.pin
     var month=  e.parameters.month;
     var data = getTimeSheet(staff,month,pin)
     return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(data) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
     }
  if (e.parameters.method == "getPin") {
    var staff = e.parameters.staff;
    var pin = e.parameters.pin
    var data = getPin(staff,pin)
    return ContentService.createTextOutput(e.parameters.callback + "(" + JSON.stringify(data) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

function setHandoverId(){
   var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
   var sheet = doc.getSheetByName("Handover");
   var range = sheet.getRange(2,1);
  var data = range.getValue()
  var id= (data+1);
  Logger.log(id);
  return id;
}

function setStaffTimes(data,alldata,id){
  
   if(data ==""){
    return;
  }

  for(staff in data){
 
    var row ={}
    var stime = data[staff]["startTime"] || alldata['Start Time'];
    var etime = data[staff]["endTime"] || alldata['End Time'];
    
    
    row['staffname']= data[staff]["name"];
    row['shift']= getShift(alldata['Start Time']);
    row['starttime']=stime;
    row['endtime']=etime;
    row['station']=alldata['Station'];
    row['handoverid'] = id;
    row['month']=getMonthName(alldata['Start Time']);
    Logger.log("Called Here and data =>>"+ row );
    insertData(row,"StaffWorkTimes");
    var sList =getStaffList();
    if(sList.indexOf(data[staff]["name"]) == -1){
      var row1 ={}
      row1['staffname']= data[staff]["name"];
      row1['pin']= Math.floor(1000 + Math.random() * 9000);
      insertData(row1,"ActiveStaffList");
    }
  }
}

function getMonthName(stringDateTime){  
  var tn= stringDateTime.split(" ");
  var splits = tn[0].split("-");
  var month = splits[1];
  return month
}

function insertData(data,sheet_name,rowNumber) {
  Logger.log("Insert called on "+ sheet_name);
  //Logger.log(data);
    
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName(sheet_name);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; //getRange(row, column, numRows, numColumns)
    var row = [];
   

    for (i in headers) {
        
        var head = headers[i];
        row.push(data[head]);
    }

    if(rowNumber === undefined){
      rowNumber= 2;
      sheet.insertRowsBefore(rowNumber, 1);
    }
    ////Logger.log(row);
    sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
}


function updateAnotherStation(updateData){
  
  for (station in updateData){
       
      var currentData = getLastHandover(station);      
      for(data in updateData[station]){
        
        if(data=="Work Performed On"){
          for(aircraft in updateData[station][data]){
            for(task in updateData[station][data][aircraft]){
              if(currentData[data][aircraft].length==0){
                currentData[data][aircraft]=[];
              }
              currentData[data][aircraft].push(updateData[station][data][aircraft][task]);
            }
          }
        }
        
        
        if(data=="Logistics Comments" || data=="Other Comments"){
            for(comments in updateData[station][data]){
              if(currentData[data].length==0){
                currentData[data]=[];
              }
             // //Logger.log("Printing from here 3"+ currentData["Other Comments"]);
              currentData[data].push(updateData[station][data][comments]);     
          }
        }
    }
      var updaterow= parseInt(currentData["activeRow"])+1;
      var formattedData =formatData(currentData);
    
      insertData(formattedData["insertToSheet"],'Handover',updaterow);
  }
}

function getStaffList(){
  var staffList = [];
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName("ActiveStaffList");
  var s = sheet.getRange(2, 1,  sheet.getLastRow(),1).getValues();
  for(var row in s){
    staffList.push(s[row][0]);
  }
 return (staffList);
}

function getTimeSheet(staff,month,pin){
  var data =[];
  var check = checkPin(staff,pin);
  if(!(check ==true || check =="Admin")){
    data.push("Pin Mismatch");
    return data;
  }
  
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName("StaffWorkTimes");
  var s = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  var rangeValues = s.getValues();
  
  var i = 0;
  for (var row in rangeValues ){
    if (rangeValues[row][0]==staff && rangeValues[row][6] ==month) {
           var dat=[]
           for(j = 1;j<6;j++){
             dat.push(rangeValues[row][j]);
           }
      data.push(dat);
     }
  }
  return data;
}

function getPin (staff,pin){
  var data =[];
  if(pin==masterPin){
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName("ActiveStaffList");
    var s = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    var rangeValues = s.getValues();
    for (var row in rangeValues ){
      if (rangeValues[row][0]==staff) {
       data.push(rangeValues[row][1]);
        Logger.log(data);
        return data;
       }
     } 
  }else{
    data.push("Pin Mismatch");
    return data;
  
  }
 

}

function checkPin(staff,pin){
  var check= false;
   var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
   var sheet = doc.getSheetByName("ActiveStaffList");
   var s = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
   var rangeValues = s.getValues();
  if(pin==masterPin){
    check = "Admin"
    return check
  }
  
  for (var row in rangeValues ){
      if (rangeValues[row][0]==staff && rangeValues[row][1] ==pin) {
        check =true
        return check;
       }
     }
  
  return check;                
}

function getLastHandover(station) {
    var data = {};
    var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName("Handover");
    var getTotalrows = 100
    var s = sheet.getRange(1, 1,sheet.getLastRow(), sheet.getLastColumn());
  
    var rangeValues = s.getValues();
    var values="";

    for (var row in rangeValues) {
        if (row == 0) {
            var headers = rangeValues[row];
        }
        if(/^\d+$/.test(station)==true){
          
          if (rangeValues[row][0] == station) {
    
            values = rangeValues[row];
            var activeRow=row;
            break;
          }
        }
        else if (rangeValues[row][1] === station) {
            values = rangeValues[row];
            var activeRow=row;
            break;
        }
    }
  
  if(values ==""){
    return data;
  }
    
    for (var i = 0; i < sheet.getLastColumn(); i++) {
        data[headers[i]] = values[i];
        if (headers[i] === "Staff") {
            var staff = values[i].split(/\n|,|, /);
          
         for(index  in staff){
            var s = staff[index].split("--"); 
           var st ={};
            st["name"]= s[0];
            st["startTime"]=s[1]||"";
            st["endTime"]=s[2]||"";
            staff[index]=st;
           if(s[0]===""){
             staff.pop();
           }
          }
          
        
            data[headers[i]] = staff;
        }
        if (headers[i] === "Work Performed On") {
            var regex = /\*([A-Z]{3,6}|[A-Z]{2}[ |-][A-Z]{3,4})\*\n/;
            var aircraftData = values[i].replace(/[\n][\*]{2,}/g, "");
            aircraftData = aircraftData.split(regex);
            var temp = {};
            
            for (var j = 1; j < aircraftData.length; j += 2) {
                var aircaftName = aircraftData[j];
                                     
                var tasks = aircraftData[j + 1].split(/[\d]{1,2}[.][ ]{3,}/);
                var task=[];
                for (var k = 1; k < tasks.length; k++) {
                    var t="";
                    t=tasks[k].replace(/#{11}/g,"</strong><br>");
                    t=t.replace(/#{10}/g,"<br><strong>");
                    t=t.split(/[-]{4,}/);
                    task[k-1]=t;
                }
           
            
                temp[aircaftName] = task;
            }
            data[headers[i]] = temp;

           
        }

        if (headers[i] === "Logistics Comments" || headers[i] === "Other Comments" || headers[i] === "Inventory Findings") {
            var comments = values[i].split(/[\d]{1,2}[.][ ]{3,}/);
            var com = [];
            for (var k = 1; k < comments.length; k++) {
                var t="";
                t=comments[k].replace(/#{11}/g,"</strong><br>");
                t=t.replace(/#{10}/g,"<br><strong>")
                t=t.split(/[-]{4,}/);
                com[k - 1] = t;
                
            }
            data[headers[i]] = com; 
        }
      if(headers[i] === "Inventory Performed By"){ 
        data[headers[i]] =values[i]
      }
    
    }
    data["activeRow"]=activeRow;
    data["shift"]=getShift(data['Start Time']);
      //Logger.log("#### END  ########");
    

   return data;

}



function getHtml(data){
  
  if(data ==""|| data.length==0){
    return data;
  
  }
  
  var html = '<body><div id="hdiv" style="margin-bottom: 20px;"><h4>Line Maintenance Shift Handover <br><span style="border-radius: .25rem;color: #fff;background-color: #343a40;padding: 0.25em 0.25em;font-size: 0.8rem;"> '+ data['Station'] +' Station </span> </h4></div>'
  html = html+ '<table  style='+'"-webkit-print-color-adjust: exact;min-width:60%"'+'><tr><td style='+css_shifttitle+'><b>Shift </b><br></td><td style='+css_shifttitle+'><b>Shift Start </b></td><td style='+css_shifttitle+'><b>Shift End </b><br></td></tr>'
  html = html+'<tr><td style='+css_sdata+'>'+getShift(data['Start Time'])+'</td><td style='+css_sdata+'>'+data['Start Time']+'</td><td style='+css_sdata+'>'+data['End Time']+'</td></tr>'
  html+= '<tr style='+css_seperator+'></tr>'
  html= html+'<tr style='+"'width:100% '"+'><td colspan="3" style='+css_titlerow+'><b>Staff</b></td></tr>'
  
  for(index in data['Staff']){
      html+='<tr><td style='+css_sdata+'>'+data['Staff'][index]['name']+'</td><td style='+css_sdata+'>'+data['Staff'][index]['startTime']+'</td><td style='+css_sdata+'>'+data['Staff'][index]['endTime']+'</td></tr>'
    }
  
   html+= '<tr style='+css_seperator+'></tr>'
   html+='<tr style='+"'width:100% '"+'><td colspan="3" style='+css_titlerow+'><b>Work Performed on Following Aircraft:</b></td></tr>'
   
   for(aircraft in data['Work Performed On']){  
    var aircraftName= aircraft.toUpperCase();   
    html +='<tr><td colspan="3" style='+css_workperforemdedata+'><b>'+aircraftName+'</b><br>'    
    for(task in data['Work Performed On'][aircraftName]){     
      for(taskdetail in data['Work Performed On'][aircraftName][task]){
           if(taskdetail == 0){
              html+= '<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Work Performed On'][aircraftName][task][taskdetail]
           }
           
          if(taskdetail == 2 || taskdetail != 0 ){
                if(taskdetail == 1){
                  var htmlt = data['Work Performed On'][aircraftName][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                  htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ");
                  htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                  htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/g," ");
                  html+= "-"+htmlt;
                }
            html+="</div>"
          }
        }      
      }
      html+="</td></tr>"
    }
  
    html+= '<tr style='+css_seperator+'></tr>'
    html+='<tr><td colspan="3" style='+css_titlerow+'<b>Van Inventory Performed By</b>'+data['Inventory Performed By']+'</td></tr>';
    html+='<tr><td colspan="3" style='+css_workperforemdedata+'>'
  
    for(task in data['Inventory Findings']){
      for(taskdetail in data['Inventory Findings'][task]){
         if(taskdetail == 0){
             html+='<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Inventory Findings'][task][taskdetail]; 
          }
          if(taskdetail == 2 || taskdetail != 0 ){
                if(taskdetail == 1){
                 var htmlt = data['Inventory Findings'][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ")
                htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/gm," ");
                html+= "-"+htmlt
                }
            html+="</div>"
          }
      }
    }
    
    html+="</td></tr>"
  
    html+= '<tr style='+css_seperator+'></tr>'
    html+='<tr><td colspan="3" style='+css_titlerow+'<b>Logistics Comments</b></td></tr>';
    html+='<tr><td colspan="3" style='+css_workperforemdedata+'>'
      for(task in data['Logistics Comments']){
        for(taskdetail in data['Logistics Comments'][task]){
          if(taskdetail == 0){
            html+='<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Logistics Comments'][task][taskdetail]
          }
          if(taskdetail == 2 || taskdetail != 0 ){

                if(taskdetail ==1){
                var htmlt = data['Logistics Comments'][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ")
                htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/gm," ");
                html+= "-"+htmlt;
                }
             html+="</div>"
          }
     
      }
    }
    html +="</td></tr>"
  
  html+= '<tr style='+css_seperator+'></tr>'
  html+='<tr><td colspan="3" style='+css_titlerow+'<b>Other Comments </b></td></tr>'
  
  html +='<tr><td colspan="3" style='+css_workperforemdedata+'>'
  for(task in data['Other Comments']){
      for(taskdetail in data['Other Comments'][task]){
         if(taskdetail == 0){
             html+='<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Other Comments'][task][taskdetail]; 
          }
          if(taskdetail == 2 || taskdetail != 0 ){
                if(taskdetail == 1){
                 var htmlt = data['Other Comments'][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ")
                htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/gm," ");
                html+= "-"+htmlt
                }
            html+="</div>"
          }
      }
    }
    html +="</td></tr></tbody></table>"
    html+="</body>"
    return html;

}



function formatData(data){
  
  var staff="";
  var html = '<body><div id="hdiv" style="margin-bottom: 20px;"><h4>Line Maintenance Shift Handover <br><span style="border-radius: .25rem;color: #fff;background-color: #343a40;padding: 0.25em 0.25em;font-size: 0.8rem;"> '+ data['Station'] +' Station </span> </h4></div>'

  
  
  html = html+ '<table style='+'"-webkit-print-color-adjust: exact;min-width:60%"'+'><tr style="background-color: #004085;"><td style='+css_shifttitle+'><b>Shift </b><br></td><td style='+css_shifttitle+'><b>Shift Start </b></td><td style='+css_shifttitle+'><b>Shift End </b><br></td></tr>'
  html = html+'<tr><td style='+css_sdata+'>'+getShift(data['Start Time'])+'</td><td style='+css_sdata+'>'+data['Start Time']+'</td><td style='+css_sdata+'>'+data['End Time']+'</td></tr>'
  html+= '<tr style='+css_seperator+'></tr>'
  html= html+'<tr style='+"'width:100% '"+'><td colspan="3" style='+css_titlerow+'><b>Staff</b></td></tr>'
  
  for(index in data['Staff']){
      staff+=data['Staff'][index]['name'];
      if(data['Staff'][index]['startTime'] != ""){
        staff +="--"+data['Staff'][index]['startTime'] + "--"
        
        if(data['Staff'][index]['endTime'] == ""){
          staff += "Shift End"
        }else{
          staff +=data['Staff'][index]['endTime'];
        }
       
      }
     staff +=String.fromCharCode(10);
    
      html+='<tr><td style='+css_sdata+'>'+data['Staff'][index]['name']+'</td><td style='+css_sdata+'>'+data['Staff'][index]['startTime']+'</td><td style='+css_sdata+'>'+data['Staff'][index]['endTime']+'</td></tr>'
    }
    
  data['Staff']=staff.replace(/[\n]{3,}/g,"\n");;
  
    var formattedString="";
    html+= '<tr style='+css_seperator+'></tr>'
    html+='<tr style='+"'width:100% '"+'><td colspan="3" style='+css_titlerow+'><b>Work Performed on Following Aircraft:</b></td></tr>'
   
    for(aircraft in data['Work Performed On']){
      
    var aircraftName= aircraft.toUpperCase();
      
    html +='<tr><td colspan="3" style='+css_workperforemdedata+'><b>'+aircraftName+'</b><br>'
   
    formattedString+="*"+aircraftName+"*";
    
    for(task in data['Work Performed On'][aircraftName]){
      formattedString+="\n"+(parseInt(task)+1)+".   ";
     // //Logger.log( data['Work Performed On'][aircraftName]);   
      
      for(taskdetail in data['Work Performed On'][aircraftName][task]){
           if(taskdetail == 0){
             formattedString+=data['Work Performed On'][aircraftName][task][taskdetail];
             
             html+= '<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Work Performed On'][aircraftName][task][taskdetail]
           }
           
          if(taskdetail == 2 || taskdetail != 0 ){
            var note = "----"+data['Work Performed On'][aircraftName][task][taskdetail].replace(/<\/strong><br>/g,"###########");
                note= note.replace(/<br><strong>/g,"##########");
                formattedString+=note; 
                
                if(taskdetail == 1){
                  var htmlt = data['Work Performed On'][aircraftName][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                  htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ");
                  htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                  htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/g," ");
                  html+= "-"+htmlt;
                }
            html+="</div>"
          }
      }
      formattedString+=String.fromCharCode(10);
      
    }
    html+="</td></tr>"
    formattedString+=String.fromCharCode(10)+"**************************************"+String.fromCharCode(10);
    }
    data['Work Performed On']=formattedString.replace(/[\n]{3,}/g,"\n");
  
  
  
  
  html+= '<tr style='+css_seperator+'></tr>'
 
  html+='<tr><td colspan="3" style='+css_titlerow+'><b>Van Inventory Count Performed By '+data['Inventory Performed By']+'</b></td></tr>'
  
  html +='<tr><td colspan="3" style='+css_workperforemdedata+'>'

    var findings="";
  
    for(task in data['Inventory Findings']){
      
      findings+=(parseInt(task)+1)+".   ";
      
      for(taskdetail in data['Inventory Findings'][task]){
         if(taskdetail == 0){
            findings+= data['Inventory Findings'][task][taskdetail];
             html+='<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Inventory Findings'][task][taskdetail];
            
          }
          if(taskdetail == 2 || taskdetail != 0 ){
            var note = data['Inventory Findings'][task][taskdetail].replace(/<\/strong><br>/g,"###########");
                note= "----"+note.replace(/<br><strong>/g,"##########");
                findings+=note;
                
                if(taskdetail == 1){
                  var htmlt = data['Inventory Findings'][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ")
                htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/gm," ");
                html+= "-"+htmlt
                }
            html+="</div>"
          }
      
      }
      findings+=String.fromCharCode(10);
    }
   html +="</td></tr>"
   
   data['Inventory Findings']=findings.replace(/[\n]{3,}/g,"\n");;
    
  html+= '<tr style='+css_seperator+'></tr>'
  html+='<tr><td colspan="3" style='+css_titlerow+'><b>Logistics Comments</b></td></tr>';
  html+='<tr><td colspan="3" style='+css_workperforemdedata+'>'
    
    var logistics="";
    for(task in data['Logistics Comments']){
      logistics+=(parseInt(task)+1)+".   ";

      for(taskdetail in data['Logistics Comments'][task]){
          if(taskdetail == 0){
            logistics+= data['Logistics Comments'][task][taskdetail];
            html+='<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Logistics Comments'][task][taskdetail]
          }
          if(taskdetail == 2 || taskdetail != 0 ){
            var note ="----"+ data['Logistics Comments'][task][taskdetail].replace(/<\/strong><br>/g,"###########");
                note= note.replace(/<br><strong>/g,"##########");
                logistics+=note; 
                
                if(taskdetail ==1){
                var htmlt = data['Logistics Comments'][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ")
                htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/gm," ");
                html+= "-"+htmlt;
                }
             html+="</div>"
          }
     
      }
      logistics+=String.fromCharCode(10);
    }
    data['Logistics Comments']=logistics.replace(/[\n]{3,}/g,"\n");;
    
 
  
  html+= '<tr style='+css_seperator+'></tr>'
  html+='<tr><td colspan="3" style='+css_titlerow+'><b>Other Comments </b></td></tr>'
  
  html +='<tr><td colspan="3" style='+css_workperforemdedata+'>'

    var other="";
  
    for(task in data['Other Comments']){
      
      other+=(parseInt(task)+1)+".   ";
      
      for(taskdetail in data['Other Comments'][task]){
         if(taskdetail == 0){
            other+= data['Other Comments'][task][taskdetail];
             html+='<div style='+css_data+'><div style='+css_sNo+'>'+(parseInt(task)+1)+'. </div>'+data['Other Comments'][task][taskdetail];
            
          }
          if(taskdetail == 2 || taskdetail != 0 ){
            var note = data['Other Comments'][task][taskdetail].replace(/<\/strong><br>/g,"###########");
                note= "----"+note.replace(/<br><strong>/g,"##########");
                other+=note;
                
                if(taskdetail == 1){
                  var htmlt = data['Other Comments'][task][taskdetail].replace(/Deferred to next shift.*$/gm,"(From last Handover)-Not Peformed -Action Required");
                htmlt=htmlt.replace(/Completed/gm,"(From last Handover)-Completed ")
                htmlt= htmlt.replace(/Deferred to Another Station/gm,"(From last Handover)-Not Peformed -Deferred to ");
                htmlt= htmlt.replace(/[\d]{2}[\/][\d]{2}[\/][\d]{4}[ ][\d]{2}[:][\d]{2}[ ][a-zA-z]{1,2}.*$/gm," ");
                html+= "-"+htmlt
                }
            html+="</div>"
          }
      
      }
      other+=String.fromCharCode(10);
    }
  
   
   data['Other Comments']=other.replace(/[\n]{3,}/g,"\n");;
  
  
    html +="</td></tr></tbody></table>"
    html+="</body>"
   

    
    var formattedData =[]
    formattedData["htmlData"]=html;
    formattedData["insertToSheet"]=data;
    return formattedData;
}

function sendemail(subject,content,receipnt){
  /*receipnt ="lmcityjetplannerhel@samco.aero"
  content =logo;
  subject = "testing logo";*/
  
    MailApp.sendEmail({
      to: receipnt,
      subject:subject,
      htmlBody: content
    });
}

function getAllHandovers(){
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName("Handover");
  var s = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  var rangeValues = s.getValues();
  var datevar="";
  var allHandovers =[];
   var tempArr ={}
  for (var row in rangeValues){
    if(row==0){
      continue;
    }
    
    var tempDate = ((rangeValues[row][2]).split(" "))[0]
    if(tempDate != datevar){
      if(datevar !=""){
        allHandovers.push(tempArr)
      } 
     
     tempArr ={}
     datevar = tempDate;
     tempArr['Date']= datevar;
     tempArr['Station']={};
     tempArr['Station'][rangeValues[row][1]]=[];
     
    }
     var tempsh = []
     tempsh.push(getShift(rangeValues[row][2]))
     tempsh.push(rangeValues[row][0])
     if(tempArr['Station'][rangeValues[row][1]]==undefined){
       tempArr['Station'][rangeValues[row][1]]=[];
     }
     tempArr['Station'][rangeValues[row][1]].push(tempsh);    
  }
  return allHandovers;
}


function getShift(starttime){
  var t = starttime.split(" ");
  var tn= t[1].split(":");
  
  starttime = Number(tn[0]);
  Logger.log(starttime)
  var shift="";
  
  if(starttime < 8){
    shift="Morning";
  } 
  else if(starttime < 15){
      shift="Day";
  }
  else{
       shift="Late";
      } 
  
  Logger.log(shift)
  return shift;
}

function populateTimeSheet(){
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
    var sheet = doc.getSheetByName("Handover");
    var s = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  
  var rangeValues = s.getValues();
 
  var timesheet = doc.getSheetByName("StaffWorkTimes"); 
   timesheet.deleteRows(2, timesheet.getLastRow());
  

  for(var i=sheet.getLastRow()-1;i>0;i--){
    
    var staffs = (rangeValues[i][4]);
    if (staffs.trim()==""){
      continue
    }
    Logger.log(rangeValues[i][4]);
    staffs= staffs.replace(/(AND)|( and )|( And )|\n|,|\/|(&)/gm,"-");
    staffs= staffs.split(/-/);
    
      for(staff in staffs){
        
        if(staffs[staff].trim()==""){
          break
        }
    var row ={}
    var stime = formatTime(rangeValues[i][2])
    var etime = formatTime(rangeValues[i][3])
    
    Logger.log(rangeValues[i][2]+"=>"+stime)
    row['staffname']= staffs[staff].trim();
    row['shift']= getShift(rangeValues[i][2]);
    row['starttime']=stime;
    row['endtime']=etime;
    row['station']=rangeValues[i][1];
    row['handoverid'] = rangeValues[i][0]
    row['month']=getMonth(stime);
        
    insertData(row,"StaffWorkTimes");
   /* var sList =getStaffList();
    
     if(sList.indexOf(data[staff]["name"]) == -1){
      var row1 ={}
      row1['staffname']= data[staff]["name"];
      Logger.log("Called Here and data =>>"+ row1 );
      insertData(row1,"ActiveStaffList");
    }*/
  }
  
}
  

  

  }

/*Function to populate timesheets from old handovers for testing*/
  function formatTime(datetime){ /*datetime in format dd/mm/yyyy hh:mm*/
    
     var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
     ];
    
    var dateandtimr= datetime.split(" ");
    
    if (dateandtimr.length ==3){
      var time=dateandtimr[1].split(":");
      
      if(dateandtimr[2].match(/p/gmi)!=null){ 
        time[0]=(parseInt(time[0],10)+12)
        dateandtimr[1]=time[0]+":"+time[1]; 
      }
    }
    var exDate=dateandtimr[0].split("/");
    var formattedDate = exDate[0]+"-"+monthNames[parseInt(exDate[1])-1]+" "+dateandtimr[1]
    
    Logger.log(formattedDate)
  
    return formattedDate

}

function setup() {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    SCRIPT_PROP.setProperty("key", doc.getId());
}

