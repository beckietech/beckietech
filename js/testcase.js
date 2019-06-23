//To mimic click on button backup, call click_on_backup_button();
function click_on_backup_button(){
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	
	//reorgMenuByPairedStr2();
	//alert("inside click_on_backup_button()");
	console.log("set disk usage");
	var diskusage="diskusage=590.80";
	setDiskUsage(diskusage);	
	
	$("#backup").click();
	
	setTimeout( function(){prepProgress("backup");},1000);
	setTimeout( function(){reportProgress("backup", 0.01);},2000);
	setTimeout( function(){reportProgress("backup", 0.47);},6000);
	setTimeout( function(){reportProgress("backup", 0.77);},9000);
	//setTimeout( function(){tolito_backup.setValue(433)}, 8000 );
	//setTimeout( function(){tolito_backup.setValue(657)}, 10000 );
	//setTimeout( function(){serverDone("backup finished")}, 12000 );
	setTimeout( function(){serverDone("BOXCMD=bkupsum&FILECOUNT=359&SIZECOUNT=28024472&TIMECOUNT=23")}, 14000 );
}

//To mimic click on button restore, call click_on_restore_button();
function click_on_restore_button(){
	//alert("inside click_on_restore_button()");
	
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	
	//mimic refresh device list for restore	
	mimic_refresh_menu();
	
	setInterval(function(){
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	},5000);
	
	$("#restore").click();
	
	setTimeout( function(){
		if(IS_CORRECT_PASSWD){
			setTimeout( function(){prepProgress("restore");},3000);
			setTimeout( function(){tolito_restore.setValue(300)}, 6000 );
			setTimeout( function(){tolito_restore.setValue(800)}, 9000 );
			setTimeout( function(){
				serverDone("Restore Finished");
				//IS_CORRECT_PASSWD=false;
			}, 15000 );
		}
	},10000);
}

//To mimic click on button setting, call click_on_setting_button();
function click_on_setting_button(){
	console.log("inside click_on_setting_button()");
	
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	
	setInterval(function(){
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	},5000);
	//click on button with id "setting"
	$("#setting").click();
	
	//click on button with id "passcode_link"
	setTimeout( function(){
			$("#passcode_link").click();
	},2000);                                               
	
	//mimic key-in passcode
	console.log("mimic key-in passcode");
	setTimeout( function(){
	//set new passcode
	var id=getDeviceId();
	var passwd=getPasswdByDeviceId(id);
	var is_set=(passwd? true : false);
	if(is_set){
		$("#ori_passcode").val("1234");
	}
	$("#new_passcode").val("0000");
	$("#cfm_passcode").val("0000");
	
	//mimic click on OK button to verify passcode
	console.log("mimic click on OK button to verify passcode");
	$("#passcode_ok_link").click();
	setTimeout( function(){prepProgress("chgpwd");},5000);
	setTimeout( function(){reportProgress("chgpwd", 0.3)}, 3000 );
 	},4000);
	
	
	//mimic send back result
	console.log("mimic send back result of chgpwd");
	setTimeout( function(){
		console.log("send back result of chgpwd");
		var msg="BOXCMD=chgpwd&OK=1";
		serverDone(msg);
	},12000);
}

//To mimic click on button setting, call click_on_setting_button();
function click_on_setting2_button(){
	console.log("inside click_on_setting2_button()");
	
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	
	setInterval(function(){
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	},5000);
	//click on button with id "setting"
	$("#setting").click();
	
	/*
	//click on button with id "passcode_link"
	setTimeout( function(){
			$("#passcode_link").click();
	},2000);                                               
	*/
	/*
	//mimic key-in passcode
	console.log("mimic key-in passcode");
	setTimeout( function(){
	//set new passcode
	var id=getDeviceId();
	var passwd=getPasswdByDeviceId(id);
	var is_set=(passwd? true : false);
	if(is_set){
		$("#ori_passcode").val("1234");
	}
	$("#new_passcode").val("0000");
	$("#cfm_passcode").val("0000");
	
	//mimic click on OK button to verify passcode
	console.log("mimic click on OK button to verify passcode");
	$("#passcode_ok_link").click();
	setTimeout( function(){prepProgress("chgpwd");},5000);
	setTimeout( function(){reportProgress("chgpwd", 0.3)}, 3000 );
 	},4000);
	
	
	//mimic send back result
	console.log("mimic send back result of chgpwd");
	setTimeout( function(){
		console.log("send back result of chgpwd");
		var msg="BOXCMD=chgpwd&OK=1";
		serverDone(msg);
	},12000);
	*/
}

//mimic refresh device list for restore
function mimic_refresh_menu(){
	setDeviceId("bbb");
	var s="index=0;udid=aaa;lastbackupfolder=0;name= beckiTech's iphone;lastbackuptime=1385962317;passwd=0000&";
	s+="index=1;udid=bbb;lastbackupfolder=6;name= Test iphone- buck;lastbackuptime=1385963668&";
	reorgMenuByPairedStr2(s);
	//check_only_one_device();
}

//mimic refresh ssid list for wifi connection
function mimic_refresh_ssid_menu(){	
	var s='n=0;t=" beckiTech\'s iphone";&n=1;t="Test iphone- buck";&';
	reorgSsidMenuByPairedStr(s);
	activateSsidMenu();
}

//To mimic click on button wifi, call click_on_wifi_button();
function click_on_wifi_button2(){
	console.log("To mimic click on button wifi, call click_on_wifi_button()");
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();

	$("#wifi").click();

	//after wifi page is shown, wait for few seconds before click on verify ok button of wifi
	setInterval(function(){
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	},5000);
				
	setTimeout( function(){
	//mimic key-in passcode
	console.log("mimic key-in passcode");
	mimic_refresh_ssid_menu();
	//set new passcode
	$("#wifi_pswd").val("buck1234");	
	var index=1;
	set_ssid_index(index);	
	},1500);
		
	setTimeout( function(){
	//mimic serverDone() of getting ssid list
	console.log("mimic serverDone()");
	var msg=wifiListCmd+'&n=0;t=" hello world\'s iphone";&n=1;t="buck \xE9\x9B\xBB\xE8\x85\xA6";&';
	serverDone(msg);	
	},3000);
	
	setTimeout( function(){
	//mimic serverDone() of getting ping status
	console.log("mimic serverDone()");
	var msg=getConnectStatusCmd+'&OK=0"';
	serverDone(msg);	
	},5000);
	
	setTimeout( function(){
		//mimic click on OK button to verify passcode
		//console.log("mimic click on OK button to verify ssid and password");
		$("#wifi_ok_link").click();		
	},5000);
	
	//console.log("return");
	//return;
	
	//setTimeout( function(){prepProgress("setssid");},6000);
	setTimeout( function(){reportProgress("setssid", 0.01);},7000);
	setTimeout( function(){reportProgress("setssid", 0.47);},9000);
	setTimeout( function(){reportProgress("setssid", 0.77);},15000);
	//mimic send back result
	console.log("mimic send back result of setssid");
	setTimeout( function(){
		console.log("send back result of setssid");
		var msg="BOXCMD=setssid&OK=1";
		serverDone(msg);
	},18000);
}

//To mimic click on button "iphone Encryption Off", call click_on_iphone_enc_off_button();
function click_on_iphone_enc_off_button(){
	console.log("To mimic clicking button 'iphone Encryption Off', call click_on_iphone_enc_off_button()");
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();

	$("#iphoneEncOff").click();

	//after iphoneEncOff page is shown, wait for few seconds before click on verify ok button of iphoneEncOff
	setInterval(function(){
	//set box connection on
	console.log("set connection on");
	setBoxConnect();
	console.log("is connection on?"+getBoxConnect());
	//reset action to current time
	reset_action_time();
	},5000);
		
	
	setTimeout( function(){
	//mimic key-in passcode
	console.log("mimic key-in passcode");	
	//set new passcode
	$("#iphoneEncOff_pswd").val("buck1234");	
	},1500);
	
	/*	
	//mimic get status of iphone encryption
	setTimeout( function(){
	//mimic key-in passcode
	console.log("mimic get status of iphone encryption");	
	//set new passcode
	doiphoneEncStatus();
	},1500);
	
	//mimic send back result
	console.log("mimic send back result of iphoneEncStatus");
	setTimeout( function(){
		console.log("send back result of iphoneEncStatus");
		var msg="BOXCMD=iphoneEncStatus&ENC_ON=0";
		serverDone(msg);
	},5000);	
	return;
	*/
	setTimeout( function(){
		//mimic click on OK button to verify passcode
		//console.log("mimic click on OK button to verify ssid and password");
		$("#iphoneEncOff_ok_link").click();		
	},5000);
	
//	console.log("return");
//	return;
	
	setTimeout( function(){prepProgress("iphoneEncOff");},6000);
	setTimeout( function(){reportProgress("iphoneEncOff", 0.01);},7000);
	setTimeout( function(){reportProgress("iphoneEncOff", 0.47);},9000);
	setTimeout( function(){reportProgress("iphoneEncOff", 0.77);},15000);
	//mimic send back result
	console.log("mimic send back result of iphoneEncOff");
	setTimeout( function(){
		console.log("send back result of iphoneEncOff");
		var msg="BOXCMD=iphoneEncOff&OK=1";
		serverDone(msg);
	},18000);
}

//To mimic refresh device list for restore
/*
$(document).ready(function(){
	mimic_refresh_menu();
});                     
*/
//To mimic click on button backup, call click_on_backup_button();
/*
$(document).ready(function(){
	setTimeout( function(){click_on_backup_button()}, 3000 );
});
*/
//To mimic click on button restore, call click_on_restore_button();

/*
$(document).ready(function(){
	mimic_refresh_menu();	
	setTimeout( function(){click_on_restore_button()}, 5000 );
});
*/

//To mimic click on button settings, call click_on_setting_button();
/*
$(document).ready(function(){
	mimic_refresh_menu();	
	setTimeout( function(){click_on_setting2_button()}, 3000 );
});
*/

//To mimic click on button wifi, call click_on_wifi_button();
/*
$(document).ready(function(){
	setTimeout( function(){click_on_wifi_button2()}, 3000 );
});
*/

//To mimic click on button "iphone Encryption Off", call click_on_iphone_enc_off_button();
/*
$(document).ready(function(){
	setTimeout( function(){click_on_iphone_enc_off_button()}, 3000 );
});
*/
