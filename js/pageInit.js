// 檢查瀏覽器 (只能在手機使用)
// 設定多國語系
var backupId="backup";		//id of button backup
var restoreId="restore";		//id of button restore
var wifiId="wifi";		//id of button restore
var backupCmd="DOCKCMD=backup";		//command for backup
var restoreCmd="DOCKCMD=restore_DATAKEY="; //command for restore
var bkupsummaryCmd="DOCKCMD=bkupsum";//command for backup summary
var chgpwdCmd="DOCKCMD=chgpwd_NEWPWD=";//command for change password
var setssidCmd="DOCKCMD=setssid_INDEX=";//command for set wifi connection of box
var wifiListCmd="DOCKCMD=wifiList";//command for get wifi list
var getConnectStatusCmd="DOCKCMD=getConnectStatus";//command for get ping status
var iphoneEncOffCmd="DOCKCMD=iphoneEncOff_PWD=";//command for set iphone encryption Off
var iphoneEncStatusCmd="DOCKCMD=iphoneEncStatus";//command for get iphone encryption status
var encryptionoffCmd="DOCKCMD=encryptionoff";
var sleepTime=25000; //25 seconds
//var home_url="http://m.beckietech.com/docking/index_test2.html";
function checkMobileSafari(){
	if (!isMobileSafari()){window.location = "unavailable.html";}
}  
function isMobileSafari() {
	return navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)
}            

//change button theme
function chg_btn_theme(btnId, themeName){
	$("#"+btnId).buttonMarkup({theme: themeName});
}
//disable button by id
function disablePageLink(btnId){
	$("#"+btnId).addClass("ui-state-disabled");
}
//enable button by id
function enablePageLink(btnId){
	$("#"+btnId).removeClass("ui-state-disabled");
}

//enable button backup
function enableBackup(){
	if(!backupId){alert("not backup id. No way to enable Backup button");}
	enablePageLink(backupId);
}
//disable button backup
function disableBackup(){
	disablePageLink(backupId);
}
//enable button restore
function enableRestore(){	
	enablePageLink(restoreId);
}
//disable button restore
function disableRestore(){
	disablePageLink(restoreId);
}
//enable button wifi
function enableWifi(){	
	enablePageLink(wifiId);
}
//disable button wifi
function disableWifi(){
	disablePageLink(wifiId);
}
//disable button backup and restore
function disableBackupAndRestore(){
	disableBackup();
	disableRestore();
}
//enable button backup and restore
function enableBackupAndRestore(){
	enableBackup();
	enableRestore();
}
//disable collapsible div for device menu selection
function disableMenu(){
	var substr=window.lang.translate('connect to beckibox');
	var subhtml='<a class="ui-collapsible-heading-toggle ui-nodisc-icon ui-btn ui-icon-circle ui-btn-icon-right ui-btn-inherit" href="#">' + substr + '</a>';
	$("#menu_div h4").addClass("ui-collapsible-heading ui-collapsible-heading-collapsed").html(subhtml);
	$("#menu_div").addClass("ui-state-disabled");
	$("#menu_div").removeClass("ui-icon-myarrow-r");
}
//enable collapsible div for device menu selection
function enableMenu(){
	var subhtml=window.lang.translate('select idevice for restore');
	
	$("#menu_div h4 a").html(subhtml);
	$("#menu_div").removeClass("ui-state-disabled");
	$("#menu_div").removeClass("ui-icon-myarrow-r");
}                                        

//disable setting link
function disableSetting(){
	$("#setting").addClass("ui-state-disabled");
}
//enable setting link
function enableSetting(){
	$("#setting").removeClass("ui-state-disabled");
}                                        

//hide passcode progress bar
function hidePasscodeBar(){
	$("#progressbar-passcode").css("display","none");
}
//show passcode progress bar
function showPasscodeBar(){
	$("#progressbar-passcode").css("display","");
}
//hide wifi progress bar
function hideWifiBar(){
	$("#progressbar-wifi").css("display","none");
}
//show wifi progress bar
function showWifiBar(){
	$("#progressbar-wifi").css("display","");
}
//hide iphone encryption off progress bar
function hideiphoneEncOffBar(){
	$("#progressbar-iphoneEncOff").css("display","none");
}
//show wifi progress bar
function showiphoneEncOffBar(){
	$("#progressbar-iphoneEncOff").css("display","");
}

//hide buttons of passcode page
function hidePasscodeBtn(){
	//hide button OK and Cancel of set/change passcode
	$("#passcode_ok_link").parent().css("display","none");
	$("#passcode_close_link").parent().css("display","none");
}

//show buttons of passcode page
function showPasscodeBtn(){
	//show button OK and Cancel of set/change passcode
	$("#passcode_ok_link").parent().css("display","");
	$("#passcode_close_link").parent().css("display","");
}

//hide buttons of wifi page
function hideWifiBtn(){
	//hide button OK and Cancel of set wifi
	$("#wifi_ok_link").parent().css("display","none");
	$("#wifi_close_link").parent().css("display","none");
}

//show buttons of wifi page
function showWifiBtn(){
	//show button OK and Cancel of set wifi
	$("#wifi_ok_link").parent().css("display","");
	$("#wifi_close_link").parent().css("display","");
}

//hide buttons of iphone encryption off page
function hideIphoneEncOffBtn(){
	//hide button OK and Cancel of set wifi
	$("#iphoneEncOff_ok_link").parent().css("display","none");
	$("#iphoneEncOff_close_link").parent().css("display","none");
}

//show buttons of iphone encryption off page
function showIphoneEncOffBtn(){
	//show button OK and Cancel of set wifi
	$("#iphoneEncOff_ok_link").parent().css("display","");
	$("#iphoneEncOff_close_link").parent().css("display","");
}


//date time string in the format: yyyy-mm-dd hh:mm
function getDateStr(){
	var d=new Date();
	var mm=d.getMonth()+1;
	var hh=d.getHours();
	var MM=d.getMinutes();
	var datestr="_DATETIME="+d.getFullYear()+"-"+((mm<10)?("0"+mm):mm)+"-"+d.getDate()+" ";
	datestr+=((hh<10)?("0"+hh):hh)+":"+((MM<10)?("0"+MM):MM);
	return datestr;
}
//put backup command to div with id user_action
function doBackup(){
	//append yyyy-mm-dd hh:mm to backupCmd
	var datestr=getDateStr();
	
	// 傳送Backup指令
	console.log(backupCmd+datestr);
	//save user action
	setUserAction(backupCmd+datestr);
	disableBackupAndRestore();
	
}
//put backup command to div with id user_action
function doBackup_no_command(){
	//append yyyy-mm-dd hh:mm to backupCmd
	var datestr=getDateStr();
	
	// 傳送Backup指令
	//console.log(backupCmd+datestr);
	//save user action
	//setUserAction(backupCmd+datestr);
	disableBackupAndRestore();
	
}

//put restore command to div with id user_action
function doRestore(){
	// 傳送Restore指令
	//var deviceID = $('#idevices').val(); 
	var backupIndex =getBackupIndex();
	if(backupIndex<0){
		alert("No backup for restore. Try it later.");
		return false;
	}
	var cmdStr = restoreCmd + backupIndex;
	console.log(cmdStr);
	//save user action
	setUserAction(cmdStr);
	disableBackupAndRestore();
	return true;
}

//put backup summary command to div with id user_action
function doBkupSummary(){
	// 傳送backup summary指令
	console.log(bkupsummaryCmd);
	//save user action
	setUserAction(bkupsummaryCmd);
	return true;
}

//change password
function doChgpwd(pswd){
	var cmdStr = chgpwdCmd+(pswd? pswd : "");
	// 傳送 change password 指令
	console.log(cmdStr);
	//save user action
	setUserAction(cmdStr);
	return true;
}

function doEncryptionOff(){
	console.log(encryptionoffCmd);
	setUserAction(encryptionoffCmd);
	return true;
}

//set wifi connection of box by index
//"DOCKCMD=setssid_INDEX="
//var setssidCmd="DOCKCMD=setssid_INDEX=";//command for set wifi connection of box
function doSetWifiByIndex(idx, pswd){	
	//var idx=get_ssid_index();
	var cmdStr = setssidCmd+(idx? idx : "")+"_PWD="+(pswd? pswd : "");
	// 傳送 set wifi 指令
	console.log(cmdStr);
	//save user action
	setUserAction(cmdStr);
	return true;
}

//set iphone encryption off
//"DOCKCMD=iphoneEncOff_PWD="
function doiphoneEncOff(pswd){
	var cmdStr = iphoneEncOffCmd+(pswd? pswd : "");
	// 傳送 set iphoneEncOff指令
	console.log(cmdStr);
	//save user action
	setUserAction(cmdStr);
	return true;
}

//get iphone encryption status
//"DOCKCMD=iphoneEncStatus="
function doiphoneEncStatus(){
	var cmdStr = iphoneEncStatusCmd;
	// 傳送 get iphoneEncStatus指令
	console.log(cmdStr);
	//save user action
	setUserAction(cmdStr);
	return true;
}

//get wifi list
//"DOCKCMD=wifiList"
function doWifiList(){
	// 傳送 get wifi list指令
	console.log(wifiListCmd);
	//save user action
	setUserAction(wifiListCmd);
	return true;
}

//get ping status
//"DOCKCMD=getConnectStatus"
function doConnectStatus(){
	// 傳送 get ping status指令
	console.log(getConnectStatusCmd);
	//save user action
	setUserAction(getConnectStatusCmd);
	return true;
}

//window.lang = new jquery_lang_js();
//$().ready(function(){
$(document).bind('pageinit', function(event){
		// 語系初始化//works IE/SAFARI/CHROME/FF
		//window.lang.run();
		//var lang = new Lang('en');
        //lang.dynamic('zh_tw', 'js_test2/langpack/zh_tw.js');
		var ulang = window.navigator.userLanguage || window.navigator.language ;
		
		var relang=ulang.toLowerCase();
		//alert("relang:"+relang);
		switch (relang){
		case "zh-tw":
			window.lang.change('zh_tw');
			break;
		case "zh-cn":
			window.lang.change('zh_cn');
			break;
		default:
			window.lang.change('en');
		}		
		
});//end bind()

$(window).bind('orientationchange', function(e, onready){
	if(onready){
    	$(document.body).addClass('portrait-onready');
    }
    if (Math.abs(window.orientation) == 90){
    	//alert('landscape');
        $(document.body).addClass('portrait');
    }
    else {
    	//alert('portrait');
        $(document.body).removeClass('portrait').removeClass('portrait-onready');
    }
 });
 // fire the orientation change event at the start, to make sure
 $(window).trigger('orientationchange', true); 

