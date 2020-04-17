var SCRIPT_PROP = PropertiesService.getScriptProperties();
var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty('key'));


function cleanSheet(){
  removeoldentries("StaffWorkTimes");
  removeoldentries("Handover");
  
}

function removeoldentries(sheetName) {
  var sheet = doc.getSheetByName(sheetName);
  var startRow = getDeleteStartRow(sheetName);
  if(startRow != null){
    Logger.log(startRow);
    Logger.log(sheet.getLastRow());
    sheet.deleteRows(startRow+1,sheet.getLastRow()-startRow); 
  }
}

function getDeleteStartRow(sheetName){
  var d = new Date();
  d.setMonth(d.getMonth() - 4);
  var remove = d.getMonth();
  var rowNum = null;
  if(sheetName=="Handover"){
    var sheet = doc.getSheetByName(sheetName);
    var s = sheet.getRange(1, 3, sheet.getLastRow(), 1);
    var rangeValues = s.getValues();
    for(var row in rangeValues){
      if (getMonthNo(rangeValues[row][0])==remove){
        return Number(row)
      }
    }
   
  }
    
  if(sheetName=="StaffWorkTimes"){
    var sheet = doc.getSheetByName(sheetName);
    var s = sheet.getRange(1, 7, sheet.getLastRow(), 1);
    var rangeValues = s.getValues();
    for(var row in rangeValues){
      if (getMonthNo(rangeValues[row][0])== remove){
        return Number(row)
      }
    } 
  }
  
  return null;
}

function getMonthNo(dates){ //can be date on format dd/mm/yyyy or dd-MMM  or MMM)
 
  var monthNames = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct","Nov", "Dec" ];
  
  if(dates.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/gm)){
    var monthNo = Number(dates.split("/")[1])-1;
    return (monthNo);
  }

  if(dates.match(/(\d{1,2}-\w{3})/)){
    var st = dates.split(" ")[0];
    var monthName = st.split("-")[1];
    var monthNo = monthNames.indexOf(monthName);
    return (monthNo);
  }
  
  if(dates.match(/(\w{3})/)){
     var monthNo = monthNames.indexOf(dates);
     return (monthNo);
  }

}
