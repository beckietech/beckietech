var ACT_KEY="user_action";		//div id for user_action
var MENU_STAT_KEY="menustat";	//div id for menu state
var BOX_CONN_KEY="box_connect";	//div id for box connection
var DISK_USAGE_KEY="disk_usage";	//div id for disk usage

var ACT_TIME=0;				//last action time
var DEV_ID="";				//current plug-in device id
var DEV_NAME="";				//current plug-in device name
var DEV_LIST={};				//device list
var SSID_LIST={};				//ssid list
var IS_CORRECT_PASSWD=false;	//is correct password?
var BAR_MAX=100;			//max value of progress bar
var IS_IFUSE_FAIL=false;		//is ifuse fail given that BeckiboxApp is stalled?

var tolito_backup=null;
var tolito_backup_backuping=null;
var tolito_restore=null;
var tolito_passcode=null;
var tolito_wifi=null;
var tolito_iphoneEncOff=null;

var overlay=null;
var target=null;
var spinner=null;

var itemBackuping=0;
var DOCK_DBG=0;
//reset action to current time
function reset_action_time(){
	var d=new Date();
	ACT_TIME=d.getTime();	
}
//is docking page idle?
//return true if no action over 10 seconds
function isDockIdle(){
	var d=new Date();
	var cur=d.getTime();
	if(!ACT_TIME){
		ACT_TIME=cur;
	}
	//console.log("time difference: "+(ACT_TIME/1000)+" seconds");
	var diff=cur - ACT_TIME;
	//console.log("time difference: "+(diff/1000)+" seconds");
	//consoleStr = "time difference: "+(diff/1000)+" seconds"
	//var someObject = {"result":{"result":{"type":"string","value":"Hello"},"wasThrown":false},"id":1};
	//var someObject = {"method": "Console.messageAdded","params": {  "message": "dahai is here"}};
	//console.log("%s - %s = %s",cur,ACT_TIME,diff);
	//console.log("%o",someObject);
	//console.info("%o",someObject);
	
	return ((diff/1000)>25);
	//return 0;
}
//periodical routine work, eg, checking if dock is idle
function routine(){
	var d=new Date();
	console.log("DOCKCMD=ping_"+d.toJSON());

	if(isDockIdle()){
	  if(window.location.href.indexOf("backup-dialog")>-1){
		console.log("page does not get ping from box for some period of time, backup-dialog");
		resetBoxConnect();
		resetMenuStat_disableMenu_disableSetting();
		disableBackupAndRestore();
		restartOverlay();
	  }else if(window.location.href.indexOf("dialog")>-1){
		console.log("page does not get ping from box for some period of time, other dialog");
     	  }else{
		
		console.log("page does not get ping from box for some period of time, set page is idle");
		resetBoxConnect();
		resetMenuStat_disableMenu_disableSetting();
		disableBackupAndRestore();
		restartOverlay();
      	  }
	}
	//else{
	//	console.log("page is not idle");	
	//}
}
function setupTimerRoutine(){
		//start periodical routine work, say every 10 seconds
		var holdtime=10000;//1 second=1000 miliseconds
		setInterval(function(){routine()}, holdtime);
}
//When this function is invoked from box side, reset action time. Ideally, every 10 second.
function pingFromBox(){                                           
	$('#backup-progress-message').fadeOut(0, function() {
  $(this).html('pingFromBox').fadeIn(0, function() {
    $(this).fadeOut(3000, function(){
      //$(this).html('Sign UP').fadeIn();
    })
  })
});
	reset_action_time();
	setBoxConnect();
	overlay.hide();
	localStorage.setItem('backupingPageNoConnectEnterCount',0);
}

function setDeviceId(id){
	if(id){
		DEV_ID=id;
	}
}

function getDeviceId(){
	return DEV_ID;
}

function setDeviceName(name){
	if(name){
		DEV_NAME=name;
	}
}

function getDeviceName(){
	return DEV_NAME;
}

//set ifuse failure
function setIfuseFail(){
	IS_IFUSE_FAIL=true;
}
function resetIfuseFail(){
	IS_IFUSE_FAIL=false;
}
function isIfuseFail(){
	return IS_IFUSE_FAIL;
}


function getPasswdForSelectedDevice(){
	var backupIndex =getBackupIndex();
	var passwd="";
	for(var key in DEV_LIST){
		if(DEV_LIST[key]['lastbackupfolder']==backupIndex){
			if(DEV_LIST[key]['passwd']){
				passwd=DEV_LIST[key]['passwd'];
			}
			break;
		}
	}
	return passwd;
}

function getPasswdByDeviceId(id){
	var passwd="";
	for(var key in DEV_LIST){
		if(DEV_LIST[key]['udid']==id){
			if(DEV_LIST[key]['passwd']){
				passwd=DEV_LIST[key]['passwd'];
			}
			break;
		}
	}
	return passwd;
}

function verifyPasswdForRestore(){
	var input_passwd=$("#pw").val();
	//compare password against device passwd
	//get password of current selected device
	var passwd=getPasswdForSelectedDevice();
	if(input_passwd==passwd){
		IS_CORRECT_PASSWD=true;
		
		var txtHeader = window.lang.translate("Passcode");
		var txtPrompt = window.lang.translate('is correct');
		showDevice(txtHeader,txtPrompt);		
	}
	else{
		//console.log("wrong passwd");
		IS_CORRECT_PASSWD=false;
		var txtHeader = window.lang.translate("Passcode");
		var txtPrompt = window.lang.translate('is wrong');
		showDevice(txtHeader,txtPrompt, closeRestorePage);
	}	
	return IS_CORRECT_PASSWD;	
}

function processPasscode(new_pswd){
	doChgpwd(new_pswd);
	//hide body of ori_pswd, new_pswd and cfm_pswd
	$("#passcode_body").html("");
	//hide button OK and Cancel of set/change passcode
	hidePasscodeBtn();
	
	tolito_passcode= jQMProgressBar('progressbar-passcode').setOuterTheme('b').setInnerTheme('e')
	.isMini(false).setMax(BAR_MAX).setStartFrom(0).setInterval(10).showCounter(true).build();
}

function processWifiByIndex(index, pswd){
	//console.log("inside processWifiByIndex, index:"+index+", pswd:"+pswd);
	doSetWifiByIndex(index, pswd);
	//hide body of ssid, pswd
	$("#wifi_body").html("");
	//hide button OK and Cancel of set/change wifi
	hideWifiBtn();
	
	tolito_wifi= jQMProgressBar('progressbar-wifi').setOuterTheme('b').setInnerTheme('e')
	.isMini(false).setMax(BAR_MAX).setStartFrom(0).setInterval(300).showCounter(true).build();
	
	//manually start progress bar
	setTimeout( function(){prepProgress("setssid");},3000);
}
function processIphoneEncOff(pswd){
	doiphoneEncOff(pswd);
	//hide body of pswd
	$("#iphoneEncOff_body").html("");
	//hide button OK and Cancel of set/change wifi
	hideIphoneEncOffBtn();
	
	tolito_iphoneEncOff= jQMProgressBar('progressbar-iphoneEncOff').setOuterTheme('b').setInnerTheme('e')
	.isMini(false).setMax(BAR_MAX).setStartFrom(0).setInterval(300).showCounter(true).build();
}

function verifyPasswdForSetting(){
	var ori_pswd=$("#ori_passcode").val();
	var new_pswd=$("#new_passcode").val();
	var cfm_pswd=$("#cfm_passcode").val();
	
	//get password of plugged-in device
	var id=getDeviceId();
	var passwd=getPasswdByDeviceId(id);
	var is_set=(passwd)?true:false;

	var txtHeader = window.lang.translate("Passcode");
	var txtPrompt = window.lang.translate('Original passcode is wrong');
	var proceed=false;	
	//if new passcode, checking reenter passcode
	//if change passcode, verify original passcode 
	//together with checking reenter passcode
	if(is_set){
		if(ori_pswd!=passwd){
			showDevice(txtHeader,txtPrompt, closeSettingPage);
		}
		else{//checking reenter passcode
			if(new_pswd!=cfm_pswd){
				txtPrompt = window.lang.translate('Re-enter passcode does not match. Try again.');
				showDevice(txtHeader,txtPrompt);
			}
			else{
				proceed=true;
				//console.log("proceed to change passcode from:"+ori_pswd+" to "+new_pswd);
				processPasscode(new_pswd);
			}
		}
	}
	else{//checking reenter passcode
		if(new_pswd!=cfm_pswd){
			txtPrompt = window.lang.translate('Re-enter passcode does not match. Try again.');
			showDevice(txtHeader,txtPrompt);
		}
		else{
			proceed=true;
			//console.log("proceed to set new passcode:"+new_pswd);
			processPasscode(new_pswd);
		}	
	}
}

function processRestoreOK(){
	restartOverlay();
	if(!doRestore()){
	tolito_restore= jQMProgressBar('progressbar-restore').setOuterTheme('b').setInnerTheme('e').
	isMini(false).setMax(BAR_MAX).setStartFrom(0).setInterval(10).showCounter(true).build();
	//							return;
	}
}
function processRestore(){
	var txtHeader = window.lang.translate("Box connection");
		//check box connection, if not connected, stop backup
		if(!isBoxConnectOn()){
			//console.log("Box connection is not ready");
			var txtPrompt = window.lang.translate('Box connection is not ready');
			showDevice(txtHeader,txtPrompt, closeRestorePage);
			setTimeout( function(){closeAnySimpleDialog()},3000);
			return;
		}
		if(isDockIdle()){
			//console.log("dock is idle, reset box connection");
			resetBoxConnect();
			var txtPrompt = window.lang.translate("Box connection is retrying");
			showDevice(txtHeader,txtPrompt,closeRestorePage);
			setTimeout( function(){closeAnySimpleDialog()},3000);
			return;
		}
		//console.log("is not idle");
		closeAnySimpleDialog();
		
		var backupIndex =getBackupIndex();
		var txtIndexNoDefine = '&nbsp;' + window.lang.translate('Please Select iDevice for Restore');
	if (backupIndex){
		
		var txtHeader = window.lang.translate('Restore') + '(' + backupIndex + ')';
		var txtPrompt = '&nbsp;' + window.lang.translate('Are you sure?');
		var txtBtnOK = window.lang.translate('OK');
		var txtBtnCancel = window.lang.translate('Cancel');
		$('<div>').simpledialog2({
			mode: 'button',
		//	mode: 'blank',
			headerText: txtHeader,
			headerClose: false,
			fullScreen: false,
			fullScreenForce: true,
			
			buttonPrompt: txtPrompt,
			buttons : {
			'OK':{
					id:"btnOK",
					click:function(){
							if(!doRestore()){
								return;
							}
	tolito_restore= jQMProgressBar('progressbar-restore').setOuterTheme('b').setInnerTheme('e').isMini(false).setMax(BAR_MAX).setStartFrom(0).setInterval(10).showCounter(true).build();
					//.run(); //start progress bar
				 }},
			'Cancel':{
					id:"btnClose",
					click:function(){
						closeRestorePage();
						},
					icon:"delete",
					theme:"c"
					}
			},
			/*
			blankContent: 
			//"<div>"+msg+"</div>"+
			"<div class='dialogBdy'>"+txtPrompt+"</div>"+
			// NOTE: the use of rel="close" causes this button to close the dialog.
			"<a onclick='processRestoreOK();' rel='close' data-role='button' href='#'>" + window.lang.translate("OK") + "</a>" +
			"<a onclick='closeRestorePage();' rel='close' data-role='button' href='#'>" + window.lang.translate("Close") + "</a>"
			
			//"<a "+
			//( (msg.toLowerCase().indexOf("backup")>-1)?
			//"onclick='closeBackupPage();return false;'":
			//"onclick='closeRestorePage();return false;'")+
			//" rel='close' data-role='button' href='#'>Close</a>"
				*/
		});
		
/*
		setTimeout( function(){
		$("#btnOK").find('.ui-btn-text').html(txtBtnOK);
		$("#btnClose").find('.ui-btn-text').html(txtBtnCancel);
		},2000 );
	*/	
	}else{

		$('<div>').simpledialog2({
				mode: 'button',
				headerText: txtHeader,
				headerClose: false,
				fullScreen: false,
				fullScreenForce: true,
				buttonPrompt: txtIndexNoDefine,
				buttons : {
					'OK':{click:function(){
						closeRestorePage();						
						}
					},
				},
			});
		}

}

function verifySsidPasscodeForWifiByIndex(){
	var ssid_index=get_ssid_index();	
	var pswd=$("#wifi_pswd").val();
	//alert("inside verifySsidPasscodeForWifiByIndex(), ssid index:"+ssid_index+", pswd:"+pswd);
		
	var txtHeader = "Wifi";
	var txtPrompt = 'Please select ssid and type password for wifi';
	
	if(!ssid_index){
		showDevice(txtHeader,txtPrompt, closeSettingPage);
	}
	else if(!pswd){//checking reenter passcode
		showDevice(txtHeader,txtPrompt, closeSettingPage);
	}
	else{
		//console.log("proceed to set ssid:"+ssid+" and password:"+pswd+" for wifi");
		processWifiByIndex(ssid_index,pswd);		
	}	
}

function verifyIphoneEncOff(){
	var pswd=$("#iphoneEncOff_pswd").val();
		
	var txtHeader = "Iphone Encryption off";
	var txtPrompt = 'Please enter password for iphone encryption off';
	
	if(!pswd){//checking iphone encryption password
		showDevice(txtHeader,txtPrompt, closeSettingPage);
	}
	else{
		console.log("proceed to set iphone encryption off with password:"+pswd);
		processIphoneEncOff(pswd);		
	}
	
}

//prepare progress for either backup or restore
function prepProgress(target){
	if(target=="backup" && tolito_backup!= null){
		//set value of progressbar be 0
		tolito_backup.setValue(0).run();
		if(tolito_backup_backuping!= null){
		//set value of progressbar be 0
		  tolito_backup_backuping.setValue(0).run();
		}	
	} else if(target=="backup" && tolito_backup_backuping!= null){
		//set value of progressbar be 0
		  tolito_backup_backuping.setValue(0).run();
			
	}	else if(target=="restore" && tolito_restore!= null){
		//set value of progressbar be 0
		tolito_restore.setValue(0).run();
	}
	else if(target=="bkupsum"){
		//do nothing
	}
	else if(target=="chgpwd" && tolito_passcode!= null){
		//show passcode progress bar
		showPasscodeBar();
		//set value of progressbar be 0
		tolito_passcode.setValue(0).run();
	}	
	else if(target=="setssid" && tolito_wifi!= null){		
		//show wifi progress bar
		showWifiBar();
		//set value of progressbar be 0
		tolito_wifi.setValue(0).run();
		//manually set progress
		setTimeout( function(){reportProgress("setssid", 0.30);},3000);
		setTimeout( function(){reportProgress("setssid", 0.80);},8000);		
	}
	else if(target=="iphoneEncOff" && tolito_iphoneEncOff!= null){
		//show wifi progress bar
		showiphoneEncOffBar();
		//set value of progressbar be 0
		tolito_iphoneEncOff.setValue(0).run();
	}
}

//report progress for either backup or restore
//target is either backup/restore
//percent is decimal number from 0 to 1
function reportProgress(target, percent){
	setBoxConnect();
	console.log("inside reportProgress(), before convert, target:"+target+", percent:"+percent);
	// parameter type check
	if (typeof percent == "string"){
		percent=percent.match("[0-9]+%")+"";
		percent=percent.replace("%","");
		percent=percent/100;
	}
	if (typeof percent != "number"){
		return;
	}
	localStorage.setItem('progress',percent*100+'%');
	var value=percent*BAR_MAX;
	console.log("inside reportProgress(), after convert, target:"+target+", value:"+value);	
	//round value to one digit after decimal point
	//value=value.toFixed(1);
	if(target=="backup" && tolito_backup!= null){
		//alert(value);
		tolito_backup.setValue(value);
		if(tolito_backup_backuping!= null){
		    tolito_backup_backuping.setValue(value);
	    }
	} else if(target=="backup" && tolito_backup_backuping!= null){
		   // alert(value);
		    tolito_backup_backuping.setValue(value);
	} else if(target=="restore" && tolito_restore!= null){
		tolito_restore.setValue(value);
	} else if(target=="chgpwd" && tolito_passcode!= null){
		tolito_passcode.setValue(value);
	}	
	else if(target=="setssid" && tolito_wifi!= null){
		tolito_wifi.setValue(value);
	}
	else if(target=="iphoneEncOff" && tolito_iphoneEncOff!= null){
		tolito_iphoneEncOff.setValue(value);
	}
}

//show message from internal
function serverDoneInternal(msg){

	var hdr="";
	if(msg.toLowerCase().indexOf("backup")>-1){
		if(tolito_backup != null){
			//tolito_backup.setValue(BAR_MAX);
		}
		hdr=window.lang.translate("Backup Result");
	}
	else if(msg.toLowerCase().indexOf("restore")>-1){
		//tolito_restore.setValue(BAR_MAX);
		hdr=window.lang.translate("Restore Result");
	}
	else if(msg.toLowerCase().indexOf("bkupsum")>-1){
		hdr=window.lang.translate("Backup") + window.lang.translate("Summary");
	}
	else if(msg.toLowerCase().indexOf("chgpwd")>-1){
		//tolito_passcode.setValue(BAR_MAX);
		hdr=window.lang.translate("Passcode");
	}
	else if(msg.toLowerCase().indexOf("encryptionoff")>-1){
		hdr=window.lang.translate("Encryption");
	}	
	else if(msg.toLowerCase().indexOf("setssid")>-1){
		hdr=window.lang.translate("Wifi");
	}	
	if(hdr){
	setTimeout( function(){
		showServerDone(hdr,msg);
		enableBackupAndRestore();
		resetUserAction();
		}, 1000 );
	}


}

//show message from server
function serverDone(msg){
	//alert("serverDone() is called with msg:"+msg);
	msg=decode_utf8(msg);
	//alert("serverDone() is called with msg:"+msg);
try{
	var hdr="";
	if(msg.toLowerCase().indexOf("backup")>-1){		
		if(tolito_backup != null){
			tolito_backup.setValue(BAR_MAX);
		}
		hdr=window.lang.translate("Backup Result");
		localStorage.setItem('serverdone',msg);		
	}
	else if(msg.toLowerCase().indexOf("restore")>-1){		
		tolito_restore.setValue(BAR_MAX);
		hdr=window.lang.translate("Restore Result");
		localStorage.setItem('serverdone',msg);		
	}
	else if(msg.toLowerCase().indexOf("bkupsum")>-1){		
		hdr=window.lang.translate("Backup") + window.lang.translate("Summary");
		localStorage.setItem('serverdone',msg);		
	}
	else if(msg.toLowerCase().indexOf("chgpwd")>-1){		
		tolito_passcode.setValue(BAR_MAX);
		hdr=window.lang.translate("Passcode");
	}
	else if(msg.toLowerCase().indexOf("encryptionoff")>-1){		
		hdr=window.lang.translate("Encryption");
	}
	else if(msg.toLowerCase().indexOf("wifilist")>-1){
		//alert("inside serverDone(), msg has wifiList keywords");
		//tolito_wifi.setValue(BAR_MAX);
		hdr=window.lang.translate("wifiList");
		//localStorage.setItem('serverdone',msg);
		//show ssid list as select menu
		//alert("show ssid list as select menu. msg:"+msg);
		ssidstr=msg.substring(msg.indexOf("&")+1);
		//alert("ssid list string:"+ssidstr);
		reorgSsidMenuByPairedStr(ssidstr);
		activateSsidMenu();
		//get ping status
		doConnectStatus();
	}	
	else if(msg.toLowerCase().indexOf("setssid")>-1){
		tolito_wifi.setValue(BAR_MAX);
		hdr=window.lang.translate("set Wifi");
		//localStorage.setItem('serverdone',msg);		
	}
	else if(msg.toLowerCase().indexOf("iphoneencoff")>-1){
		tolito_iphoneEncOff.setValue(BAR_MAX);
		hdr=window.lang.translate("iPhone Encryption Off");
		//localStorage.setItem('serverdone',msg);		
	}
	else if(msg.toLowerCase().indexOf("iphoneencstatus")>-1){
		//tolito_iphoneEncOff.setValue(BAR_MAX);
		hdr=window.lang.translate("iPhone Encryption Status");
		//localStorage.setItem('serverdone',msg);		
	}
	else if(msg.toLowerCase().indexOf("getconnectstatus")>-1){		
		hdr=window.lang.translate("Connection Status");		
	}
	else{
		alert("else case in serverDone()");
	}
	if(hdr){		
	setTimeout( function(){
		showServerDone(hdr,msg);
		enableBackupAndRestore();
		resetUserAction();
		}, 1000 );
	}
	else{
		//alert("translation of hdr is null. stop showServerDone()");
	}
}
catch(err) {
}
}

//alert server message
function alertServer(msg){
	
}

function translateServerDone(msg){
try{
	//alert("inside translateServerDone, incoming msg:"+msg);
	//default is backup finished
	var txtMsg = window.lang.translate('Backup Finished');
	if(msg.toLowerCase().indexOf("r1:")>-1){//r1 error
		txtMsg = window.lang.translate('r1');
		if(txtMsg=="r1"){
			txtMsg="Re-plug and retry last operation";
			// return ack to box
			console.log("DOCKCMD=r1_show_up");
		}
	}
	else if(msg.toLowerCase().indexOf("r2:")>-1){//r2 error
		txtMsg = window.lang.translate('r2');
		if(txtMsg=="r2"){
			txtMsg="target device iOS version is too old, and restore process can not be completed. Please upgrade device to latest version and try again";
			// return ack to box
			console.log("DOCKCMD=r2_show_up");
		}
	}
	else if(msg.toLowerCase().indexOf("r3:")>-1){//r3 error
		txtMsg = window.lang.translate('r3');
		if(txtMsg=="r3"){
			txtMsg="Please turn off  “Find my iPhone” and redo the restore process.";
			// return ack to box
			console.log("DOCKCMD=r3_show_up");
		}
	}
	else if(msg.toLowerCase().indexOf("b1:")>-1){//b1 error
		txtMsg = window.lang.translate('b1');
		if(txtMsg=="b1"){
			txtMsg="Please reconfirm the cable is connected and try again.";
			// return ack to box
			console.log("DOCKCMD=b1_show_up");
			// clear local variable 'backuping'
			localStorage.setItem('backuping','0');		
		}
	}                                                              
	else if(msg.toLowerCase().indexOf("b2:")>-1){//b2 error
		txtMsg = window.lang.translate('b2');
		if(txtMsg=="b2"){
			txtMsg="Hard disk volume is not sufficient, please remove data to release storage space or replace larger volume hard drive.";
			// return ack to box
			console.log("DOCKCMD=b2_show_up");
			// clear local variable 'backuping'
			localStorage.setItem('backuping','0');		
		}
	}
	else if(msg.toLowerCase().indexOf("b3:")>-1){//b3 error
		txtMsg = window.lang.translate('b3');
		if(txtMsg=="b3"){
			txtMsg="There is old encryption on your device, please remove it by connecting to iTunes or see description in Beckibox user’s manual.";
			// return ack to box
			console.log("DOCKCMD=b3_show_up");
			// clear local variable 'backuping'
			localStorage.setItem('backuping','0');		
		}
	}
	else if(msg.toLowerCase().indexOf("b4:")>-1){//b4 error
		txtMsg = window.lang.translate('b4');
		if(txtMsg=="b4"){
			txtMsg="Device backup quota is full, please remove device to release capacity for backup this device.";
			// return ack to box
			console.log("DOCKCMD=b4_show_up");
			// clear local variable 'backuping'
			localStorage.setItem('backuping','0');		
		}
	}
	else if(msg.toLowerCase().indexOf("bkupsum")>-1){//backup summary
		if(tolito_backup!=null){
			tolito_backup.setValue(BAR_MAX);
		}
		//BOXCMD=bkupsum&FILECOUNT=xxx&SIZECOUNT=xxx&TIMECOUNT=xxx
		var json={};
		//line delimitered with &
		var pairs=(msg)?msg.split("&"):[];
		var num_pair=pairs.length;
		for(var i=0; i<num_pair; i++){                 
			if(pairs[i]==""){continue};
			var pieces=pairs[i].split('=');
			json[pieces[0]]=pieces[1];
		}
		txtMsg='';
		var num_mb=0, num_gb=0, num_seconds;
		for(var key in json){
			if(key=="FILECOUNT"){
				txtMsg+='<div>'+window.lang.translate('Files')+':'+json[key]+'</div>';
			}
			if(key=="SIZECOUNT"){//1 Mb=1,048,576 bytes
				num_mb=json[key]/1048576;
				if(num_mb<1024){//smaller than 1GB
					txtMsg+="<div>"+window.lang.translate('Size')+":"+parseFloat(num_mb).toFixed(2) +" MB</div>";
				}
				else{//over 1 GB
					txtMsg+="<div>"+window.lang.translate('Size')+":"+parseFloat(num_mb/1024).toFixed(2) +" GB</div>";
				}
			}
			if(key=="TIMECOUNT"){//seconds
				num_seconds=json[key];
				if(num_seconds<60){//smaller than 1 minute
					txtMsg+="<div>"+window.lang.translate('Time')+":"+num_seconds +" "+window.lang.translate('seconds')+"</div>";
				}
				//else if(num_seconds<3600){//larger than 1 minute and smaller than 1 hour
				else{//larger than 1 minute and smaller than 1 hour
					var minutes=parseInt(num_seconds/60);
					num_seconds-=(minutes*60);
					txtMsg+="<div>"+window.lang.translate('Time')+":"+minutes +" "+window.lang.translate('minutes')+" "+num_seconds +" "+window.lang.translate('seconds')+"</div>";
				}
			}
		}
		// return ack to box
		console.log("DOCKCMD=summary_show_up");
		// clear local variable 'backuping'
		localStorage.setItem('backuping','0');		
	}//bkupsum
	else if(msg.toLowerCase().indexOf("chgpwd")>-1){//change passcode
		//BOXCMD=chgpwd&OK=1; BOXCMD=chgpwd&OK=0&ERRMSG=...
		if(msg.toLowerCase().indexOf("ok=1")>-1){
			txtMsg=window.lang.translate('Successfully Set UI Passcode');
		}
		else{
			txtMsg=window.lang.translate('Failed to Set UI Passcode');		
		}
	}
	else if(msg.toLowerCase().indexOf("restore")>-1){//restore
		//BOXCMD=restore&OK=1;
		txtMsg = window.lang.translate('Restore Finished');
	}
	else if(msg.toLowerCase().indexOf("encryptionoff")>-1){//encryption off
		//alert(msg);
		if(msg.toLowerCase().indexOf("ok=1")>-1){
			txtMsg = window.lang.translate('Off') + window.lang.translate('Done');
			if(overlay){
				overlay.hide();
			}
		}else if(msg.toLowerCase().indexOf("processing=1")>-1){
			restartOverlay();
			txtMsg = '';
	    }else{
			txtMsg = '';
		}
	}
	else if(msg.toLowerCase().indexOf("wifilist")>-1){//ssid list for wifi
		//BOXCMD=wifiList&n=0;t=""&n=1;t="";
		if(msg.toLowerCase().indexOf("n=0")>-1){
			txtMsg = 'Successfullly get ssid list';	
		}
		else{			
			txtMsg='Failed to get ssid list';		
		}
	}
	else if(msg.toLowerCase().indexOf("setssid")>-1){//wifi configuration
		//BOXCMD=setssid&OK=1;		
		if(msg.toLowerCase().indexOf("ok=1")>-1){			
			txtMsg = 'Successfullly set Wifi connection';
		}
		else{			
			txtMsg='Failed to set Wifi connection';		
		}
	}
	else if(msg.toLowerCase().indexOf("iphoneencoff")>-1){//iphone encryption off
		//BOXCMD=iphoneEncOff&OK=1;		
		if(msg.toLowerCase().indexOf("ok=1")>-1){			
			txtMsg = 'Successfullly set iphone Encryption off';
		}
		else{			
			txtMsg='Failed to set iphone Encryption off';		
		}
	}
	else if(msg.toLowerCase().indexOf("iphoneencstatus")>-1){//iphone encryption status
		//BOXCMD=iphoneEncStatus&ENC_ON=[1|0];		
		if(msg.toLowerCase().indexOf("enc_on=0")>-1){
			txtMsg ='iphone Encryption is already off';
		}
		else{			
			txtMsg='Please set iphone Encryption off';
		}
	}
	else if(msg.toLowerCase().indexOf("getconnectstatus")>-1){//iphone encryption status
		//BOXCMD=getConnectStatus&OK=[1|0];		
		if(msg.toLowerCase().indexOf("ok=1")>-1){
			txtMsg ='Internet connection is on already';
		}
		else{			
			//txtMsg='Ping is NOT OK. Internet connection is off';
			txtMsg='';
		}
	}
	//alert("at the end of translateServerDone, outgoing txtMsg:"+txtMsg);
	return txtMsg;
}
catch(err) {
}
}
                                             
// sleep function
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

//dialog make sure
function dialogMakesure(){
	console.log("DOCKCMD=clear_dialog_flag");
			localStorage.removeItem('dialog_hdr');
			localStorage.removeItem('dialog_msg');
			localStorage.removeItem('serverdone');
}

//show message of device done
function showServerDone(hdr, msg){
    //close simpledialog in 8 seconds
    setTimeout( function(){			
    		closeAnySimpleDialog();
	},10000);
	
	closeAnySimpleDialog();
	//delay 1 second before bring up aother simpledialog
	setTimeout( function(){			
	//alert("before translateServerDone(msg) with msg:"+msg+", and hdr:"+hdr);
	var txtMsg = translateServerDone(msg);
	//alert("after translateServerDone(), txtMsg:"+txtMsg);
	if (txtMsg){
		//alert("before call simpledialog2()");
	$('#show_serverdone').simpledialog2({
    mode: 'blank',
    headerText: hdr,
    headerClose: false,
    callbackClose: function () { 
    	if(msg.toLowerCase().indexOf("backup")>-1){
			setTimeout( function(){
    		closeBackupPage();
    		},2000 );
    	}
    	else if(msg.toLowerCase().indexOf("bkupsum")>-1){
			setTimeout( function(){
    		closeBackupPage();
    		},2000 );
    	}
    	else if(msg.toLowerCase().indexOf("restore")>-1){
    		closeRestorePage();
    	}
    	else if(msg.toLowerCase().indexOf("chgpwd")>-1){
    		//hide passcode progress bar
    		hidePasscodeBar();
    		//$("#progressbar-passcode").css("display","none");
    		//close passcode page
    		closePasscodePage();
    		//close setting page
    		setTimeout( function(){
    			closeSettingPage();
    		},2000 );
    	}
    	else if(msg.toLowerCase().indexOf("encryptionoff")>-1){
			setTimeout( function(){
    		closeSettingPage();
    		},2000 );
    	}		
		else if(msg.toLowerCase().indexOf("setssid")>-1){
			//alert("hide wifi progress bar");
			//hide wifi progress bar
    		hideWifiBar();
			//get status of ping
			setTimeout( function(){
    		console.log("get status of connection");
			doConnectStatus();			
    		},6000 );
			
			setTimeout( function(){
				closeWifiPage();
    		},10000 );			
    	}
		else if(msg.toLowerCase().indexOf("iphoneencoff")>-1){			
    		hideiphoneEncOffBar();
			setTimeout( function(){
    		closeiphoneEncOffPage();
    		},2000 );
    	}
		else if(msg.toLowerCase().indexOf("iphoneencstatus")>-1){
			console.log("get back to iphone enc status");
			//hideiphoneEncOffBar();
			//setTimeout( function(){
    		//closeiphoneEncOffPage();
    		//},2000 );
    	}
		else if(msg.toLowerCase().indexOf("getconnectstatus")>-1){
			console.log("get back to ping status");
			if(msg.toLowerCase().indexOf("ok=1")>-1){
				console.log("Internet connection is ok. Show dialog box");
			}
			else{
				console.log("Internet connection is off. Do not show dialog box");
			}
		}
    },
    blankContent: 
      //"<div>"+msg+"</div>"+
      "<div class='dialogBdy'>"+txtMsg+"</div>"+
      // NOTE: the use of rel="close" causes this button to close the dialog.
      "<a onclick='dialogMakesure();' rel='close' data-role='button' href='#'>" + window.lang.translate("Close") + "</a>"
      //"<a "+( (msg.toLowerCase().indexOf("backup")>-1)?"onclick='closeBackupPage();return false;'":"onclick='closeRestorePage();return false;'")+" rel='close' data-role='button' href='#'>Close</a>"
    });
	}
    },1000);
}

//show message of device,eg. iPhone is ready to do backup/restore
function showDevice(hdr, msg,callback){
	closeAnySimpleDialog();
	$('#show_device').simpledialog2({
    mode: 'blank',
    headerText: hdr,
    headerClose: false,
    callbackClose: function(){ 
    	if(typeof callback == "function"){
    		setTimeout( callback, 500 );
    	}
    },
    blankContent: 
      "<div class='dialogBdy'>"+msg+"</div>"+
      // NOTE: the use of rel="close" causes this button to close the dialog.
      "<a rel='close' data-role='button' href='#page-main'>" + window.lang.translate("Close") + "</a>"
  })
}

//show message of device,eg. iPhone is ready to do backup/restore
function showMenuReady(hdr, msg,callback){
	closeAnySimpleDialog();
	$('#show_device').simpledialog2({
    mode: 'blank',
    headerText: hdr,
    headerClose: false,
    callbackClose: function(){ 
    	if(typeof callback == "function"){
    		setTimeout( callback, 500 );
    	}
    },
    blankContent:"<div class='dialogBdy'>"+msg+"</div>"
  })
}


/*
* check only one device and bind click event to collapse_idevices
*/
function check_only_one_device(){
	//step 1, enable collapsible div first
	enableMenuAndSetting();
	
	//step 2, check item and bind event 
	$( "#collapse_idevices > li > a" ).click(function() {
			$( "#collapse_idevices > li > a" ).removeClass("ui-icon-mycheck").addClass("ui-icon-myarrow-r");
			//add ui-icon-mycheck to this anchor only
			$(this).removeClass("ui-icon-carat-r").removeClass("ui-icon-myarrow-r").addClass("ui-icon-mycheck");
			//console.log("value:"+$(this).attr("value"));
	});                                  
}
/*
* get selected device data key
*/
function getBackupIndex(){
	var key=$( "#collapse_idevices > li > a.ui-icon-mycheck" ).attr("value");
	//console.log("data key:"+key);
	return key;
}


/*
* reorgnize menu by paired string in the format key1=value1&key2=value2, new line is added to separate lines
* eg. index=0;udid=0001;lastbackupfolder=0;name= beckiTech's iphone;lastbackuptime=1385962317&index=1;udid=0002;lastbackupfolder=6;name= Test iphone- buck;lastbackuptime=1385963668&
* 	index=1;udid=40-char;lastbackupfolder=6;name= Test iphone- buck;lastbackuptime=1385963668&
*/
function reorgMenuByPairedStr2(s){
	//replace_s with 's for input
	if(s){
		s=s.replace(/_s /g,"'s ");
	}
	var num_line=0, num_pair=0;
	var json={};
	//line delimitered with &
	var lines=(s)?s.split("&"):[];
	num_line=lines.length;
	for(var i=0; i<num_line; i++){                 
		if(lines[i]==""){
			continue;
		}
		json[i]={};
		DEV_LIST[i]={};
		//pairs delimitered with ;
		var pairs=lines[i].split(';');
		num_pair=pairs.length;
		for(var j=0; j<num_pair; j++){
			var pieces=pairs[j].split('=');
			json[i][pieces[0]]=pieces[1];
			DEV_LIST[i][pieces[0]]=pieces[1];
		}
	}
	//build collapse menu
	var html='';
	for(var key in json){
		if(json[key]['udid']==getDeviceId()){
			html+='<li class=""><a href="#" value="'+json[key]['lastbackupfolder']+'" style="background-color:#d2d2d2" class="myudid ui-nodisc-icon ui-btn ui-icon-mycheck ui-btn-icon-right">'+json[key]['name']+'</a></li>';
			//also set device name by the way
			setDeviceName(json[key]['name']);
			//console.log("device name:"+deviceName);
		}
		else{
			html+='<li class=""><a href="#" value="'+json[key]['lastbackupfolder']+'" class="ui-nodisc-icon ui-btn ui-icon-circle ui-btn-icon-right">'+json[key]['name']+'</a></li>';
		}
	}
	//refresh collapse menu
	$("#collapse_idevices").html(html);
	check_only_one_device();
	
	//use time out to avoid blocking reorgMenuByPairedStr2(s)
	if(getMenuStat().indexOf("outofdate")>-1){
		var txtHeader = window.lang.translate("Device list");
		var txtPrompt = window.lang.translate('Has been refreshed');
		/*
		//show dialog in 1 second and close dialog in 4 seconds
		setTimeout( function(){
			//showDevice(txtHeader, txtPrompt);
			if(typeof document.baseURI.split("#")[1] == "undefined"){
			  showMenuReady(txtHeader, txtPrompt);
			}
		}, 500 );
		setTimeout( function(){
			if(typeof document.baseURI.split("#")[1] == "undefined"){
			closeAnySimpleDialog();	
			}
		}, 4000 );
*/
		//check if ifuse fail
		
		if(isIfuseFail()){
			var txtHeader2 = window.lang.translate("Device");
			var txtPrompt2 = window.lang.translate("Please restart device");
			setTimeout( function(){
				showDevice(txtHeader2, txtPrompt2);				
			}, 6000 );
		}
	}
	//at this point, outofdate will be changed to uptodate
	setMenuStat();
	//enable button backup and restore
	enableBackupAndRestore();
	//enable button wifi
	enableWifi();
	//if no device on the list, disable button restore
	if(!html){
		disableRestore();
	}
	
	// hide ios overlay////////////////////////////////
//	overlay.hide();
	
	
	//add device name to button backup
	/*if(DEV_NAME){
		setTimeout( function(){
			var html=$("#backup").html();
			if(html.indexOf(DEV_NAME)==-1){
				$("#backup").html(html+DEV_NAME);
			}
		}, 3000 );		
	}*/
}

/*
* reorgnize ssid menu by paired string in the format key1=value1&key2=value2, new line is added to separate lines
* eg. n=0;t= beckiTech's iphone;&n=1;t= Test iphone- buck;&
*/
function reorgSsidMenuByPairedStr(s){
	//console.log("ssid list:"+s);
	//replace_s with 's for input
	if(s){
		s=s.replace(/_s /g,"'s ");
	}
	var num_line=0, num_pair=0;
	var json={};
	//line delimitered with &
	var lines=(s)?s.split("&"):[];
	num_line=lines.length;
	for(var i=0; i<num_line; i++){                 
		if(lines[i]==""){
			continue;
		}
		json[i]={};
		SSID_LIST[i]={};
		//pairs delimitered with ;
		var pairs=lines[i].split(';');
		num_pair=pairs.length;
		for(var j=0; j<num_pair; j++){
			var pieces=pairs[j].split('=');
			json[i][pieces[0]]=pieces[1];
			SSID_LIST[i][pieces[0]]=pieces[1];
		}
	}
	//build collapse menu
	var html='';
	for(var key in json){
		//html+='<li class=""><a href="#" value="'+key+'" class="ui-nodisc-icon ui-btn ui-icon-circle ui-btn-icon-right">'+json[key]['name']+'</a></li>';
		html+='<option value="'+key+'">'+json[key]['t']+'</option>';
		//console.log(html);
	}
	//refresh collapse menu of ssid
	$("#select_ssid").html(html);
		
	//enable button backup and restore
	enableBackupAndRestore();
	//enable button wifi
	enableWifi();
	//if no device on the list, disable button restore
	if(!html){
		disableWifi();
	}	
}

function refreshSsidMenu(selector){
	//refresh and force rebuild
	console.log("refresh select menu");
	var ssid_selector=selector;
	if(!selector){
			console.log("selector is NULL");
			ssid_selector=$('#select_ssid').selectmenu();
	}
	ssid_selector.selectmenu('refresh', true);
}
function activateSsidMenu(){
	console.log("activate ssid menu");
	
	var ssid_selector=$('#select_ssid').selectmenu();
	//unbind change event before bind
	//ssid_selector.unbind("change");
	//bind change event to ssid menu
	ssid_selector.unbind("change", ssid_change).bind("change", ssid_change);
	//refresh and force rebuild
	refreshSsidMenu(ssid_selector);
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}
function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function ssid_change(event, ui){
	console.log("select menu is changed");
	//var selectedval = ($(".select option:selected").val());
	console.log("selected value:"+$('#select_ssid').selectmenu().val());
}
/*
* get selected ssid index
**/
function get_ssid_index(){
	return $('#select_ssid').selectmenu().val();
}

/*
* set ssid index with given index
**/
function set_ssid_index(index){
	if(index){
		$('#select_ssid').selectmenu().val(index);
	}
}

function showWebSocketStatus(){
	$("#websocket").html(window.WebSocket.CONNECTING);
}
// set web version
function setWebAppVersionString(){
  lastmod = document.lastModified     // get string of last modified date
  lastmoddate = Date.parse(lastmod)   // convert modified string to date
  if (lastmoddate == 0) {               // unknown date (or January 1, 1970 GMT)
        //document.writeln("Last Modified: Unknown")
  } else {
        //document.writeln("Last Modified: " + lastmod)
        var parts = lastmod.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
        var buildString = Date.UTC(+parts[3], parts[2]-1, +parts[1], +parts[4], +parts[5]);
//        $("#webversion").html('WebApp Version:'+Number(buildString)/1000000);
//        $("#webversion").html('WebApp Version:'+lastmod);
        $("#webversion").html('WebApp Version:1.1');
  }	
}
// set box version
function setVersionString(string){
	$("#boxversion").html(string);
}
//set user action
function setUserAction(action){
	$("#"+ACT_KEY).html(action);
}
//reset user action
function resetUserAction(){
	$("#"+ACT_KEY).html("");
}
//get user action
function getUserAction(){
	var action= $("#"+ACT_KEY).html();
	resetUserAction();
	return action;
}
//set menu status
function setMenuStat(){
	$("#"+MENU_STAT_KEY).html("menustat=uptodate");
}
//reset menu status
function resetMenuStat(){
	$("#"+MENU_STAT_KEY).html("menustat=outofdate");
}

// set disk usage of box
function setBoxUsage(string){	
	$("#boxusage").html("Disk Usage:"+string);
}
// set disk type of box
function setDiskType(string){	
	$("#disktype").html("Disk Type:"+((string=="1")?"HDD":"SSD"));
}
//get menu status
function getMenuStat(){
	return $("#"+MENU_STAT_KEY).html();
}
//set box connection on
function setBoxConnect(){
	$("#"+BOX_CONN_KEY).html("connection=on");
}
//reset box connection off
function resetBoxConnect(){
	//$("#"+BOX_CONN_KEY).html("connection=off");
}
//get box connection status
function getBoxConnect(){
	return $("#"+BOX_CONN_KEY).html();
}
//is box connection on?
function isBoxConnectOn(){
	var conn=getBoxConnect();
	//console.log("box connection:"+conn);
	var isOn=(conn.indexOf("connection=on")>-1);
	//console.log("is connection on:"+isOn);
	return isOn;
	//return 1;
}

//set disk usage
//sample s: diskusage=30.2  //unit is MB 
function setDiskUsage(s){
	$("#"+DISK_USAGE_KEY).html(s)
}
//get disk usage
function getDiskUsage(){
	return $("#"+DISK_USAGE_KEY).html();
}
//reset disk usage
function resetDiskUsage(){
	$("#"+DISK_USAGE_KEY).html("diskusage=0");
}
                          

//close jquery dialog
function closeAnyDialog(){
	setTimeout( function(){$('.ui-dialog').dialog('close');}, 200 );
}
//Immediatly close all open dialogs
function closeAnySimpleDialog(){
	//Immediatly close the open dialog
	//if($.mobile.sdCurrentDialog){
		//$.mobile.sdCurrentDialog.close();
		//$(document).trigger('simpledialog', {'method':'close'});
	//}
	//Immediatly close all open dialogs (Note: nesting probably is a bad, bad idea)
	$(document).trigger('simpledialog', {'method':'close'});
}

//close backup page
function closeBackupPage(){
	var url = window.location.href;
	url = url.split('#')[0];
	//alert("inside closeBackupPage(), go to home url:"+url);
	window.location=url;
}

//close restore page
function closeRestorePage(){
	$("#restore_close_link").click();
	IS_CORRECT_PASSWD=false;
}

//close passwd page
function closeRestorePasscodePage(){
	$("#restore_passcode_close_link").click();	
}

//close setting page
function closeSettingPage(){
	$("#setting_close_link").click();
}
//close passcode page
function closePasscodePage(){
	$("#passcode_close_link").click();
}
//close wifi page
function closeWifiPage(){
	$("#wifi_close_link").click();
}
//close iphone encryption page
function closeiphoneEncOffPage(){
	console.log("inside closeiphoneEncOffPage(), click on iphoneEncOff_close_link");
	$("#iphoneEncOff_close_link").click();
}
// build app install btn
function buildAppInstallBtn(s){
	overlay.hide();
	txt="http://www.beckietech.com/mobile/beckie_reg.aspx?datas="+s;
	$("#app_install_btn").attr("href",txt);
	$("#app_install_btn").removeClass("ui-state-disabled");
}
function buildAppInstallBtnCheck(){
	restartOverlay();
	//$("#app_install_btn").html("");
	$("#app_install_btn").addClass("ui-state-disabled");
}
function buildAppInstallBtnInstalled(){
	//$("#app_install_btn").html("");
	$("#app_install_btn").addClass("ui-state-disabled");
}

function refreshPage(){
	history.go(0);
}

function jump(h){
    var url = location.href;               //Save down the URL without hash.
    location.href = "#"+h;                 //Go to the target element.
    history.replaceState(null,null,url);   //Don't like hashes. Changing it back.
}
/*
function resetMenuStat_disableMenu(){
	resetMenuStat();
	disableMenu();
}*/

function EnableiOSOverlay(){
		//alert("Main");
	var opts = {
		lines: 13, // The number of lines to draw
		length: 11, // The length of each line
		width: 5, // The line thickness
		radius: 17, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		color: '#FFF', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};
//var target = document.createElement("div");
//document.body.appendChild(target);
 target = document.getElementById('middlepart');
 spinner = new Spinner(opts).spin(target);
 overlay = iosOverlay({
text: "",
spinner: spinner
});
 

 
//window.setTimeout(function() {
//overlay.hide();
//}, 5);
	
}

function restartOverlay(){
	if(DOCK_DBG){
		console.log("return from restartOverlay()");
		return;
	}
	
	if(overlay){
		  overlay.hide();
	 }
	EnableiOSOverlay();
}
function resetMenuStat_disableMenu_disableSetting(){
	resetMenuStat();
	disableMenu();
	disableSetting();
	//alert(window.location.href);
	
	//if(overlay){
	//	  overlay.hide();
	//}
	//EnableiOSOverlay();
}

function enableMenuAndSetting(){
	enableMenu();
	enableSetting();
}

function ShowVersion(){
	alert("0.0.00000");
}


//backup page show up
$(document).on('pageshow', '#backup-dialog', function () {
		console.log("DOCKCMD=pageshow_PAGE=backup-dialog");
		reset_action_time();
		setBoxConnect();
		var txtHeader = window.lang.translate("Box connection");
		if(!DOCK_DBG){
			console.log("inside setting page, debug:"+DOCK_DBG);
		//check box connection, if not connected, stop backup
		if(!isBoxConnectOn()){
			var txtPrompt = window.lang.translate('Box connection is not ready');
			showDevice(txtHeader,txtPrompt, closeBackupPage);
			return;
		}
		if(isDockIdle()){
			resetBoxConnect();
			var txtPrompt = window.lang.translate("Box connection is retrying");
			showDevice(txtHeader,txtPrompt,closeBackupPage);
			return;
		}
		}//end DOCK_DBG
		//get estimated disk usage from device.
		var usagehtml=getDiskUsage();
		var pairs=usagehtml?usagehtml.split("="):[];
		var usage=(pairs.length>0)? pairs[1]:0;
		//Assume 200 MB will make progress bar reach 50% in time, then, calculate max by Math.round(parseFloat(usage/200).toFixed(1))*1000
		//always multiply by 1000 to make progress bar moving smoothly
		//BAR_MAX=(usage<100)? 1000:(Math.round(parseFloat(usage/200).toFixed(1))*1000);
		tolito_backup = jQMProgressBar('progressbar-backup').setOuterTheme('b').setInnerTheme('e')
		.isMini(true).setMax(BAR_MAX).setStartFrom(1).setInterval(10).showCounter(true).build();
		//.run(); //start progress bar
		//call doBackup();
		localStorage.setItem('backuping','1');
		doBackup();
});

//backup page , backuping, continue progress
$(document).on('pageshow', '#backup-dialog-backuping', function () {
		console.log("DOCKCMD=pageshow_PAGE=backup-dialog-backuping");
		reset_action_time();
		setBoxConnect();
		var txtHeader = window.lang.translate("Box connection");
		//check box connection, if not connected, stop backup
		if(!isBoxConnectOn()){
			var txtPrompt = window.lang.translate('Box connection is not ready');
			showDevice(txtHeader,txtPrompt, closeBackupPage);
			return;
		}
		if(isDockIdle()){
			resetBoxConnect();
			var txtPrompt = window.lang.translate("Box connection is retrying");
			showDevice(txtHeader,txtPrompt,closeBackupPage);
			return;
		}
		//get estimated disk usage from device.
		var usagehtml=getDiskUsage();
		var pairs=usagehtml?usagehtml.split("="):[];
		var usage=(pairs.length>0)? pairs[1]:0;
		//Assume 200 MB will make progress bar reach 50% in time, then, calculate max by Math.round(parseFloat(usage/200).toFixed(1))*1000
		//always multiply by 1000 to make progress bar moving smoothly
		//BAR_MAX=(usage<100)? 1000:(Math.round(parseFloat(usage/200).toFixed(1))*1000);
		tolito_backup_backuping = jQMProgressBar('progressbar-backup-backuping').setOuterTheme('b').setInnerTheme('e')
		.isMini(true).setMax(BAR_MAX).setStartFrom(0).setInterval(10).showCounter(true).build();
		//.run(); //start progress bar
		//call doBackup();
		///////////////////////doBackup();
		localStorage.setItem('backuping','1');
		reportProgress('backup',localStorage.getItem('progress'));
		doBackup_no_command();
		localStorage.setItem('backupingPageNoConnectEnterCount',Number(localStorage.getItem('backupingPageNoConnectEnterCount'))+1);
	if(Number(localStorage.getItem('backupingPageNoConnectEnterCount')) > 1){
		localStorage.setItem('backuping','0');
		jump('page_main');
	}
});

// main page show up
// set routine every 10 secends.
$(document).on('pageshow', '#page_main', function () {
		console.log("DOCKCMD=pageshow_PAGE=main");		
		disableBackupAndRestore(); //
		//reset menuStat, disable menu, disable setting

		if(!DOCK_DBG){
			console.log("inside main page, debug:"+DOCK_DBG);
			resetMenuStat_disableMenu_disableSetting();
		}
		resetUserAction();
		if(!DOCK_DBG){
			console.log("inside main page, debug:"+DOCK_DBG);		
			setupTimerRoutine();
		}
		
		//push down for iPad
		if(navigator.userAgent.indexOf("iPad")>-1){
			$("#middlepart").addClass("pushdown");
		}
		//replace icons
		//remove class "ui-icon-mycheck", add class ui-icon-mybackup
		$("#backup").removeClass("ui-icon-mycheck").addClass("ui-icon-mybackup");
		//remove class "ui-icon-mycheck", add class ui-icon-myrestore
		$("#restore").removeClass("ui-icon-mycheck").addClass("ui-icon-myrestore");
		//remove class "ui-corner-all
		$("#collapse_idevices").parent().parent().removeClass("ui-corner-all");
		
		
		console.log("DOCKCMD=menuload");

		if(!DOCK_DBG){
			console.log("inside main page, debug:"+DOCK_DBG);
		restartOverlay();
		}
		//showWebSocketStatus();
		itemBackuping=localStorage.getItem('backuping');
		if(itemBackuping==1){
			jump('backup-dialog-backuping');
			//location.href = 'http://m.beckietech.com/docking/test2/index.html#backup-dialog-backuping';
		}
		localStorage.setItem('backupingPageNoConnectEnterCount',0);
		// clear local variable 'backuping'
		localStorage.setItem('backuping','0');		
		
		var msg=localStorage.getItem('serverdone');
		if(msg!='' && msg!=null){
			console.log("dialog not finish : "+msg);
			//sleep(1000);
            serverDoneInternal(msg);
		}
		//
		setWebAppVersionString();
});



	
//restore page show up
//var tolito_restore=null;
$(document).on('pageshow', '#restore-dialog', function () {
		console.log("DOCKCMD=pageshow_PAGE=restore-dialog");
		if(!IS_CORRECT_PASSWD){
			$("#passwd").click();
			return;
		}
		else{
			processRestore();
		}		
});

//setting page show up
$(document).on('pageshow', '#setting_page', function () {
		console.log("DOCKCMD=pageshow_PAGE=setting_page");
		restartOverlay();
	var txtHeader = window.lang.translate("Box connection");
	if(!DOCK_DBG){
		console.log("inside setting page, debug:"+DOCK_DBG);
	//check box connection, if not connected, stop backup
	if(!isBoxConnectOn()){
		var txtPrompt = window.lang.translate('Box connection is not ready');
		showDevice(txtHeader,txtPrompt, closeSettingPage);
		return;
	}
	if(isDockIdle()){
		resetBoxConnect();
		var txtPrompt = window.lang.translate("Box connection is retrying");
		showDevice(txtHeader,txtPrompt,closeSettingPage);
		return;
	}
	}//end DOCK_DBG
	//console.log("inside pageshow of setting_page");
	//alert("inside pageshow of setting_page");
	var id=getDeviceId();
	var passwd=getPasswdByDeviceId(id);
	var is_set=(passwd? true : false);
	//console.log("device id:"+id+", password:"+passwd+" is set?"+is_set);
	var txt='<span class="ui-btn-inner"><span class="ui-btn-text">' + window.lang.translate("Set UI Passcode") + '</span></span>';
	//if passcode is set, show "Change passcode"
	//else, show "Set UI passcode"
	if(is_set){
		//console.log("passcode is set, use Change passcode");
		txt='<span class="ui-btn-inner"><span class="ui-btn-text">' + window.lang.translate("Change UI Passcode") + '</span></span>';
	}
	$("#passcode_link").html(txt);
	//alert("at the end");
});

//iphone encryption off page show up
$(document).on('pageshow', '#iphoneEncOff_page', function () {
	console.log("DOCKCMD=pageshow_PAGE=iphoneEncOff_page");	
	var html='';
	
	html+='<label>Password:</label>';
	html+='<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" name="iphoneEncOff_pswd" id="iphoneEncOff_pswd" value=""></div>';
	
	$("#iphoneEncOff_body").html(html);
	//show button OK and Cancel of set/change ssid and passcode of wifi configuration
	showIphoneEncOffBtn();
	//get iphone encryption status
	doiphoneEncStatus();
});

//setting page show up
$(document).on('pageshow', '#passcode_page', function () {
	console.log("DOCKCMD=pageshow_PAGE=passcode_page");
	//alert("inside pageshow of passcode_page");
	//if passcode is set, it is Change passcode
	//else, it is Set UI passcode
	var id=getDeviceId();
	var passwd=getPasswdByDeviceId(id);
	var is_set=(passwd? true : false);
	//console.log("device id:"+id+", password:"+passwd+" is set?"+is_set);
	var html='';
	if(is_set){
		html+='<label for="ori_passcode">' + window.lang.translate("Original Password") + ':</label>';
		html+='<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="password" name="ori_passcode" id="ori_passcode" value=""></div>';
	}
	html+='<label for="passcode">' + window.lang.translate("New Password") + ':</label>';
	html+='<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="password" name="new_passcode" id="new_passcode" value=""></div>';
	html+='<label for="cfm_passcode">' + window.lang.translate("Reenter Password") + ':</label>';
	html+='<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="password" name="cfm_passcode" id="cfm_passcode" value=""></div>';
	
	$("#passcode_body").html(html);
	//show button OK and Cancel of set/change passcode
	showPasscodeBtn();
});

//wifi page show up
//$(document).on('pageshow', '#wifi-dialog', function () {
// jquery mobile Selectmenu Widget example
//	https://api.jquerymobile.com/selectmenu/#entry-examples
//
$(document).on('pageshow', '#wifi_page', function () {
	console.log("DOCKCMD=pageshow_PAGE=wifi_page");	
	var html='';
	
	html+='<label>SSID:</label>';	
	//html+='<div class="ui-select"><select name="select_ssid" id="select_ssid">';	
	//html+='<option value="not-connect">NOT connected</option>';	
	//html+='</select></div></div>';	
	html+='<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" name="select_ssid" id="select_ssid" value=""></div>';
	html+='<label>Password:</label>';
	html+='<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset"><input type="text" name="wifi_pswd" id="wifi_pswd" value=""></div>';
	
	$("#wifi_body").html(html);
	//show button OK and Cancel of set/change ssid and passcode of wifi configuration
	showWifiBtn();
	//temporarily refresh ssid menu and wait for new ssid list to come
	//refreshSsidMenu();
	//get wifi list
	//doWifiList();	
});

/*
WEBCLIP-DETECT - JavaScript detection of whether a web page is running on iOS 
as a web page or a full screen web clip. 

Written in 2011 by Christopher H. Casebeer <christopher at the domain chc.name>

To the extent possible under law, the author(s) have dedicated all copyright 
and related and neighboring rights to this software to the public domain 
worldwide. This software is distributed without any warranty.

You should have received a copy of the CC0 Public Domain Dedication along with 
this software. If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
*/

/*global window */
/*global navigator */
var webclipDetect = (function () {
	'use strict';
	var maxBrowserSizes = {
		'iPhone': {
			portrait: 416,
			landscape: 268
		},
		'iPad': {
			portrait: 946,
			landscape: 690
		}
	};
	function getDevice() {
		var ua = String(navigator.userAgent),
			device = ua.match(/iPhone|iPod/) ? 'iPhone' : (ua.match(/iPad/) ? 'iPad' : null);
		return device;
	}
	function isWebclip() {
		var portrait = (window.orientation !== 90 && window.orientation !== -90),
			height = window.innerHeight,
			device = getDevice(),
			sizeLimits = device && maxBrowserSizes[device],
			webclip = !!device && (height > (portrait ? sizeLimits.portrait : sizeLimits.landscape));
			return webclip;
	}
	return {
		isWebclip: isWebclip,
		isIos: function () { return !!getDevice(); },
		getIosDevice: getDevice
	};
}());

