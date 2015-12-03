/* 

Create an array of objects. Each object is a PC reference and displayed
as circles on the page.
    - Production PCs from 349 - 461 (DONE)
    - Training from 1-9 (DONE)
    - Gna includes Glen, Jason, Nissan Huddle, Simcoe Huddle, Scripting 
      server
The color of the circle will change depending on an issue found.
    - Virus def's more than 3 days old (DONE)
    - Unable to ping (DONE)
    - Windows Updates not current (DONE)

TO DO'S:
    Check total updates available and show a ratio type: Windows Updates: 25/75
    Fix Viewport issue where hover div shows outside of the viewport

*/

var pcs = [];
var PC;
var htmlCode = "";
//object items
var PCShortName;
var pcName;
var VDef;
var connected;
var WU;


function getTheDate(vdate){
        testYear = vdate.substring(0,4);
        testMonth = vdate.substring(5,7);
        testDay = vdate.substring(9,10);
        
        switch (testMonth) {
            case "1":
                testMonth = "January";
                break;
            case "2":
                testMonth = "February";
                break;                
            case "3":
                testMonth = "March";
                break;                
            case "4":
                testMonth = "April";
                break;                
            case "5":
                testMonth = "May";
                break;                
            case "6":
                testMonth = "June";
                break;                
            case "7":
                testMonth = "July";
                break;                
            case "8":
                testMonth = "August";
                break;                
            case "9":
                testMonth = "September";
                break;                
            case "10":
                testMonth = "October";
                break;                
            case "11":
                testMonth = "November";
                break;                
            case "12":
                testMonth = "December";
                break;
        }    
    return testMonth;
                console.log(testMonth);
}

/* ###########################################################################################
                        CREATE THE PAGE LAYOUT WITH PC BUBBLES
############################################################################################*/                        

/* Break the PCs out into bubbles and provide numrical names */ 
function createPCObject(PSArray) {    
    for (i = 0; i < PSArray.length; i++){
        
        var PCShortName = PSArray[i].PCShortName;
        var PCLongName = PSArray[i].PCName.value;
        var OnlineStatus = PSArray[i].OnlineStatus;
        var WUStatus = PSArray[i].WUStatus.TotalUpdateCount;
        
        var VDefPass = PSArray[i].VirusDefDate;
        
        getTheDate(VDefPass);
        var VDefDate = testMonth + " " + testDay + " " + testYear;

        VDef = Date.parse(VDefDate);

        
        todaysDate = new Date(); //Todays date
        dateDifference = todaysDate - VDef; //Difference between today and JSON date
        if (dateDifference > 273600000 || isNaN(VDef) === true){
            VDefBubbleChange = "bad";
        } else {VDefBubbleChange = "good";}
        
        //get the PC online status.
        if (OnlineStatus === true){
            OnlineStatus = "Online"
            if (WUStatus > 0 && VDefBubbleChange === "good"){
                createCircle(PCShortName, PCLongName, OnlineStatus, WUStatus, VDef, VDefBubbleChange, " bubbleGood");
            } else {
                if (WUStatus === undefined || WUStatus <= 0){
                    WUStatus = 0;
                }
                createCircle(PCShortName, PCLongName, OnlineStatus, WUStatus, VDef, VDefBubbleChange, " bubbleIssue");
            }
        } else {
            OnlineStatus = "Offline"
            WUStatus = 0;
            createCircle(PCShortName, PCLongName, OnlineStatus, WUStatus, VDef, VDefBubbleChange, " bubbleBad");
        }
    }
}

//Create the HTML needed for the bubble
function createCircle(short,long,status,wu,vd,vdefhighlight,className){
    //Build out the HTML for the on hover span
    statusHTML = "<h2>"+long+"</h2>";
    
    //Online status highlight in status div
    if (status === "Online"){statusClass = "good"} else {statusClass = "bad"}
    statusHTML += "<div class="+statusClass+">Status: "+status+"</div>";
    
    //Windows Update highlight in status div
    if (wu > 0){statusClass = "good"} else {statusClass = "bad"}
    statusHTML += "<div class="+statusClass+">Windows Update Count: "+wu+"</div>";
    
    //Virus Definitions older than 2 days highlight in status div
    VDefDate = new Date(vd); //Date from JSON data
    VDefLastUpdate = (VDefDate.getMonth()+1) +"-"+VDefDate.getDate()+"-"+VDefDate.getFullYear(); //Make a readable date
    if (isNaN(VDefDate)){VDefLastUpdate = "Unknown";}
    statusHTML += "<div class="+vdefhighlight+">SEP Definition Date: "+VDefLastUpdate+"</div>";
    
    //create the bubble and a hovered div with all the information.
    htmlCode += "<div class='bubble"+className+"'><span class='status hidden'>"+statusHTML+"</span><div class='bubbletxt'>"+short+"</div></div>";
    var divID = "wrapper";
    writeHTML(divID, htmlCode);
}

//write HTML to a class name provided.
function writeHTML(divClass, HTMLcode){
    document.getElementById(divClass).innerHTML = HTMLcode;
}

/* #####################################################################################
                                    MAIN APP
##################################################################################### */  

createPCObject(pingStatus)   // variable with PC objects listed in PingStatus.js


$(".bubble").hover(function(){
    $(this).children().toggleClass("hidden");
    //$(this).children(".status").html(+PCShortName);
});

