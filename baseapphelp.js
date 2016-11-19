var bah_ANCIENT_LASTMODIFIED_TIME = "157766400000";

var bah_ACTION_TYPE_DEFAULT = 0;
var bah_ACTION_SUBTYPE_DEFAULT = 0;
var bah_ACTION_TYPE_INSERTORUPDATE = 1;
var bah_ACTION_TYPE_REQUEST =2;
var bah_ACTION_TYPE_DELETE = 3;

var bah_OBJECT_TYPE_DEFAULT = 0;
var bah_OBJECT_SUBTYPE_DEFAULT = 0;
////////////////////////////// activeObjectList
var bah_activeObjectList = [];
////////////////////////////// get key
function bah_getObjectKey(objectid, objectsubid, packageid, objecttype, objectsubtype) {
	var key = objectid;	
	if (packageid)
		key = packageid+key;
	if (objectsubid)
		key = key+objectsubid;
	if (objecttype)
		key = key+objecttype;
	if (objectsubtype)
		key = key+objectsubtype;	
	return key;
}
function bah_getObjectListKey(parentid, packageid, objecttype, objectsubtype) {
	var key = parentid;	
	if (packageid)
		key = packageid+key;
	if (objecttype)
		key = key+objecttype;
	if (objectsubtype)
		key = key+objectsubtype;	
	return key;
}
////////////////////////////// localStorage
function bah_setObjectListFromStorage(parentid, packageid, objecttype, objectsubtype, txnlogList) {
	if (!txnlogList || txnlogList.length==0)
		return;
	var key = bah_getObjectListKey(parentid, packageid, objecttype, objectsubtype);
	localStorage.setItem(key, JSON.stringify(txnlogList));
}
function bah_getObjectListFromStorage(parentid, packageid, objecttype, objectsubtype) {
	var key = bah_getObjectListKey(parentid, packageid, objecttype, objectsubtype);
	var str = localStorage.getItem(key);
	if (str==null)
		return null;
	else {
		var txnlogList = JSON.parse(str);
		return txnlogList;		
	}
}
function bah_removeObjectListFromStorage(parentid, packageid, objecttype, objectsubtype) {
	var key = bah_getObjectListKey(parentid, packageid, objecttype, objectsubtype);
	localStorage.removeItem(key);
}
function bah_setObjectFromStorage(objectid, objectsubid, packageid, objecttype, objectsubtype, txnlog) {
	if (!txnlog)
		return;
	var key = bah_getObjectKey(objectid, objectsubid, packageid, objecttype, objectsubtype);
	localStorage.setItem(key, JSON.stringify(txnlog));
}
function bah_getObjectFromStorage(objectid, objectsubid, packageid, objecttype, objectsubtype) {
	var key = bah_getObjectKey(objectid, objectsubid, packageid, objecttype, objectsubtype);
	var str = localStorage.getItem(key);
	if (str==null)
		return null;
	else {
		var txnlog = JSON.parse(str);
		return txnlog;		
	}
}
function bah_removeObjectFromStorage(objectid, objectsubid, packageid, objecttype, objectsubtype) {
	var key = bah_getObjectKey(objectid, objectsubid, packageid);
	localStorage.removeItem(key);
}
////////////////////////////// activeObjectList related functions
function bah_pushWithoutDup(list, element) {
	if (!list || !element)
		return;
	var i = 0;
	var found = 0;
	for (i=0; i<list.length; i++) {
		if (list[i]==element) {
			found = 1;
			break;
		}
	}
	if (found==0) {
		list.push(element);
	}
}
function bah_activeObjectHasSameKey(element1, element2) {
	if (!element1 || !element2)
		return 0;
	if (
		element1.packageid==element2.packageid &&
		element1.parentid==element2.parentid &&
		element1.objectid==element2.objectid &&
		element1.objectsubid==element2.objectsubid &&
		element1.objecttype==element2.objecttype &&
		element1.objectsubtype==element2.objectsubtype)
		return 1;
	else
		return 0;
}
function bah_pushIntoActiveObjectListWithoutDup(list, element) {
	if (!list || !element)
		return;
	var i = 0;
	var found = 0;
	for (i=0; i<list.length; i++) {
		if (bah_activeObjectHasSameKey(list[i],element)) {
			found = 1;
			list.lastmodifiedtime = element.lastmodifiedtime;
			list.childlist = element.childlist;
			break;
		}
	}
	if (found==0) {
		list.push(element);
	}
}
function bah_updateActiveObjectListWithObject(objectid, objectsubid, packageid, objecttype, objectsubtype, lastmodifiedtime) {
	var i = 0;
	var moduleOut = null;
	for (i=0; i<bah_activeObjectList.length; i++) {
		if (objectid==bah_activeObjectList[i].objectid &&
			objectsubid==bah_activeObjectList[i].objectsubid &&
			objecttype==bah_activeObjectList[i].objecttype &&
			objectsubtype==bah_activeObjectList[i].objectsubtype &&
			packageid==bah_activeObjectList[i].packageid) {
			bah_activeObjectList[i].lastmodifiedtime = lastmodifiedtime;
			moduleOut = bah_activeObjectList[i].module;
			break;
		}
	}
	return moduleOut;	
}
function bah_removeFromActiveObjectListWithObject(objectid, objectsubid, packageid, objecttype, objectsubtype) {
	var i = 0;
	var moduleOut = null;
	for (i=0; i<bah_activeObjectList.length; i++) {
		if (objectid==bah_activeObjectList[i].objectid &&
			objectsubid==bah_activeObjectList[i].objectsubid &&
			objecttype==bah_activeObjectList[i].objecttype &&
			objectsubtype==bah_activeObjectList[i].objectsubtype &&
			packageid==bah_activeObjectList[i].packageid) {
			moduleOut = bah_activeObjectList[i].module;
			bah_activeObjectList.splice(i, 1);
			break;
		}
	}
	return moduleOut;	
}

function bah_updateActiveObjectListWithObjectList(parentid, packageid, objecttype, objectsubtype, txnlogList) {
	//console.log("bah_updateActiveObjectListWithObjectList: parentid="+parentid);
	var i = 0;
	var moduleOut = null;
	for (i=0; i<bah_activeObjectList.length; i++) {
		
		//console.log("bah_updateActiveObjectListWithObjectList: bah_activeObjectList[i].parentid="+bah_activeObjectList[i].parentid);
		if (parentid==bah_activeObjectList[i].parentid &&
			objecttype==bah_activeObjectList[i].objecttype &&
			objectsubtype==bah_activeObjectList[i].objectsubtype &&
			packageid==bah_activeObjectList[i].packageid) {
			
			//construct childlist
			var j = 0;
			var childlist = [];
			for (j=0; j<txnlogList.length; j++) {
				var childObj =  {"objectid": txnlogList[j].objectid, "objectsubid": txnlogList[j].objectsubid,"lastmodifiedtime": txnlogList[j].lastmodifiedtime};
				childlist.push(childObj);
				//console.log("bah_updateActiveObjectListWithObjectList: childlist[0]="+childlist[0].objectid+" "+childlist[0].lastmodifiedtime);
			}
			bah_activeObjectList[i].childlist = childlist;
			moduleOut = bah_activeObjectList[i].module;
			break;
		}
	}
	return moduleOut;	
}
//////////////////////////////saveOject and saveObjects functions
//changetype 0 for insert, 1 for update, 2 for delete
function bah_setChangeObject(changeObject) {
	if (!changeObject)
		return;
	var str = localStorage.getItem("changeObjectList");
	if (str==null) {
		var changeObjectList = [];
		changeObjectList.push(changeObject);
		localStorage.setItem("changeObjectList", JSON.stringify(changeObjectList));
	}
	else {
		var changeObjectList = JSON.parse(str);
		var i=0;
		var found = 0;
		for (i=0; i<changeObjectList.length; i++) {
			if (
			changeObjectList[i].packageid==changeObject.packageid &&	
			changeObjectList[i].parentid==changeObject.parentid &&	
			changeObjectList[i].objectid==changeObject.objectid &&	
			changeObjectList[i].objectsubid==changeObject.objectsubid &&	
			changeObjectList[i].objecttype==changeObject.objecttype &&	
			changeObjectList[i].objectsubtype==changeObject.objectsubtype) {
				found = 1;
				if (changeObjectList[i].changetype==changeObject.changetype) {
					//do nothing
				}
				else if (changeObjectList[i].changetype==0) {
					if (changeObject.changetype==0 ||changeObject.changetype==1) {
						//do nothing
					}
					else if (changeObject.changetype==2) {
						changeObjectList.splice(i, 1);//remove existing
					}
				}
				else if (changeObjectList[i].changetype==1) {
					if (changeObject.changetype==0 ||changeObject.changetype==1) {
						//do nothing
					}
					else if (changeObject.changetype==2) {
						changeObjectList.splice(i, 1);//remove existing
						changeObjectList.push(changeObject);//add new
					}
				}
				else if (changeObjectList[i].changetype==2) {
					if (changeObject.changetype==0 ||changeObject.changetype==1) {
						changeObjectList.splice(i, 1);//remove existing
						changeObjectList.push(changeObject);//add new
					}
					else if (changeObject.changetype==2) {
						//do nothing
					}
				}
			}
		}
		if (found==0)
			changeObjectList.push(changeObject);
		localStorage.setItem("changeObjectList", JSON.stringify(changeObjectList));
	}	
}
function bah_saveObject(txnlog) {
	if (!txnlog)
		return;
	if (txnlog.parentid) {
		var found = 0;
		var localStorageTxnlogList = bah_getObjectListFromStorage(txnlog.parentid, txnlog.packageid, txnlog.objecttype, txnlog.objectsubtype);
		if (!localStorageTxnlogList) {
			var txnlogList = [];
			txnlogList.push(txnlog);
			bah_setObjectListFromStorage(txnlog.parentid, txnlog.packageid, txnlog.objecttype, txnlog.objectsubtype, txnlogList);
		}
		else {
			var k=0;
			for (k=0; k<localStorageTxnlogList.length; k++) {
				if (txnlog.packageid==localStorageTxnlogList[k].packageid &&
					txnlog.objectid==localStorageTxnlogList[k].objectid &&
					txnlog.objectsubid==localStorageTxnlogList[k].objectsubid &&
					txnlog.objecttype==localStorageTxnlogList[k].objecttype &&
					txnlog.objectsubtype==localStorageTxnlogList[k].objectsubtype
				){
					//updating
					found = 1;
					localStorageTxnlogList[k] = txnlog;
					break;
				}
			}
			//inserting
			if (found==0) {
				localStorageTxnlogList.push(txnlog);
			}
			bah_setObjectListFromStorage(txnlog.parentid, txnlog.packageid, txnlog.objecttype, txnlog.objectsubtype, localStorageTxnlogList);
		}
		var changeObject = {
				"packageid": txnlog.packageid, 	
				"parentid": txnlog.parentid,
				"objectid": txnlog.objectid,
				"objectsubid": txnlog.objectsubid,			
				"objecttype": txnlog.objecttype,
				"objectsubtype": txnlog.objectsubtype,
				"changetype": found};		
		bah_setChangeObject(changeObject);		
	}
	else {
		var existing = bah_getObjectFromStorage(txnlog.objectid, txnlog.objectsubid, txnlog.packageid, txnlog.objecttype, txnlog.objectsubtype);
		var found = 0;
		if (existing!=null)
			found = 1;
		bah_setObjectFromStorage(txnlog.objectid, txnlog.objectsubid, txnlog.packageid, txnlog.objecttype, txnlog.objectsubtype, txnlog);
		var changeObject = {
				"packageid": txnlog.packageid, 	
				"objectid": txnlog.objectid,
				"objectsubid": txnlog.objectsubid,			
				"objecttype": txnlog.objecttype,
				"objectsubtype": txnlog.objectsubtype,
				"changetype": found};		
		bah_setChangeObject(changeObject);		
	}
}

////////////////////////////// getOject and getObjects functions

//for single object: localStorage stores as:
//objectid as key and stringified txnlog as value (whose jsnstr is stringified object) 
function bah_getObject(objectid, objectsubid, packageid, objecttype, objectsubtype, module) {
	var txnlog = bah_getObjectFromStorage(objectid, objectsubid, packageid, objecttype, objectsubtype);
	if (txnlog==null) {
		var activeObject = {
			"packageid": packageid, 	
			"objectid": objectid,
			"objectsubid": objectsubid,			
			"objecttype": objecttype,
			"objectsubtype": objectsubtype,
			"actiontype": bah_ACTION_TYPE_REQUEST,
			"module": module,
			"lastmodifiedtime": bah_ANCIENT_LASTMODIFIED_TIME};		
		bah_pushIntoActiveObjectListWithoutDup(bah_activeObjectList, activeObject);		
		return null;
	}
	else {
		var activeObject = {
				"packageid": packageid, 	
				"objectid": objectid,
				"objectsubid": objectsubid,				
				"objecttype": objecttype,
				"objectsubtype": objectsubtype,
				"actiontype": bah_ACTION_TYPE_REQUEST,
				"module": module,	
				"lastmodifiedtime": txnlog.lastmodifiedtime};
		bah_pushIntoActiveObjectListWithoutDup(bah_activeObjectList, activeObject);
		var obj = JSON.parse(txnlog.jsnstr);
		return obj;
	}
}
//for parent-child objectlist: localStorage stores as:
//parentid as key and stringified txnlog list as value (whose members are txnlog object
//and whose member's jsnstr is stringified object)
function bah_getObjects(parentid, packageid, objecttype, objectsubtype, module) {
	var txnlogList = bah_getObjectListFromStorage(parentid, packageid, objecttype, objectsubtype);
	if (txnlogList==null) {
		var activeObject = {
			"packageid": packageid, 	
			"parentid": parentid,
			"objecttype": objecttype,
			"objectsubtype": objectsubtype,
			"actiontype": bah_ACTION_TYPE_REQUEST,
			"module": module,
			"lastmodifiedtime": bah_ANCIENT_LASTMODIFIED_TIME};
		bah_pushIntoActiveObjectListWithoutDup(bah_activeObjectList, activeObject);			
		return null;
	}

	var objList = [];
	var childList = [];
	var i = 0;
	for (i=0; i<txnlogList.length; i++) {
		var obj = JSON.parse(txnlogList[i].jsnstr);
		objList.push(obj);
		var childObj =  {"objectid": txnlogList[i].objectid, "objectsubid": txnlogList[i].objectsubid,"lastmodifiedtime": txnlogList[i].lastmodifiedtime};
		childList.push(childObj);		
	} 
	
	var activeObject = {
			"packageid": packageid, 	
			"parentid": parentid,
			"objecttype": objecttype,
			"objectsubtype": objectsubtype,
			"childlist": childList,	
			"actiontype": bah_ACTION_TYPE_REQUEST,
			"module": module,
			"lastmodifiedtime": bah_ANCIENT_LASTMODIFIED_TIME};
	bah_pushIntoActiveObjectListWithoutDup(bah_activeObjectList, activeObject);	
	//console.log("bah_getObjects: bah_activeObjectList[0].parentid="+bah_activeObjectList[0].parentid);
	return objList;
}
////////////////////////////// connecting to server functions
function bah_prepServerRequest() {
	var txnlogList = [];
	var i=0;
	var str = localStorage.getItem("changeObjectList");
	if (str!=null) {
		var changeObjectList = JSON.parse(str);
		for (i=0; i<changeObjectList.length; i++) {
			var actiontype = bah_ACTION_TYPE_INSERTORUPDATE;
			var jsnstr = null;
			if (changeObjectList[i].changetype==2) {
				actiontype = bah_ACTION_TYPE_DELETE;
			}
			else {
				if (changeObjectList[i].parentid) {
					var theList = bah_getObjectListFromStorage(changeObjectList[i].parentid, changeObjectList[i].packageid, changeObjectList[i].objecttype, changeObjectList[i].objectsubtype);
					if (theList!=null) {
						var j=0;
						for (j=0; j<theList.length; j++) {
							if (
									theList[j].packageid==changeObjectList[i].packageid &&	
									theList[j].objectid==changeObjectList[i].objectid &&	
									theList[j].objectsubid==changeObjectList[i].objectsubid &&	
									theList[j].objecttype==changeObjectList[i].objecttype &&	
									theList[j].objectsubtype==changeObjectList[i].objectsubtype) {
								jsnstr = theList[j].jsnstr;
								break;
							}
						}
					}
				}
				else {
					var item = bah_getObjectFromStorage(changeObjectList[i].objectid, changeObjectList[i].objectsubid, changeObjectList[i].packageid, changeObjectList[i].objecttype, changeObjectList[i].objectsubtype);
					if (item!=null)
						jsnstr = item.jsnstr;
				}
			}
			var txnlog = {
					"packageid": changeObjectList[i].packageid, 	
					"parentid": changeObjectList[i].parentid,
					"objectid": changeObjectList[i].objectid,
					"objectsubid": changeObjectList[i].objectsubid,
					"objecttype": changeObjectList[i].objecttype,
					"objectsubtype": changeObjectList[i].objectsubtype,
					"jsnstr": jsnstr,	
					"actiontype": actiontype,
					"lastmodifiedtime": changeObjectList[i].lastmodifiedtime
			};
			if (actiontype== bah_ACTION_TYPE_INSERTORUPDATE && jsnstr==null) {
				
			}
			else {
				txnlogList.push(txnlog);
			}
				
		}
		localStorage.removeItem("changeObjectList");
	}
	for (i=0; i<bah_activeObjectList.length; i++) {
		if (bah_activeObjectList[i].parentid) {
			var jsnstr = JSON.stringify(bah_activeObjectList[i].childlist);
			var txnlog = {
					"packageid": bah_activeObjectList[i].packageid, 	
					"parentid": bah_activeObjectList[i].parentid,
					"objecttype": bah_activeObjectList[i].objecttype,
					"objectsubtype": bah_activeObjectList[i].objectsubtype,
					"jsnstr": jsnstr,	
					"actiontype": bah_activeObjectList[i].actiontype,
					"lastmodifiedtime": bah_activeObjectList[i].lastmodifiedtime
			};
			txnlogList.push(txnlog);
		}
		else {
			var txnlog = {
					"packageid": bah_activeObjectList[i].packageid, 	
					"objectid": bah_activeObjectList[i].objectid,
					"objectsubid": bah_activeObjectList[i].objectsubid,
					"objecttype": bah_activeObjectList[i].objecttype,
					"objectsubtype": bah_activeObjectList[i].objectsubtype,
					"actiontype": bah_activeObjectList[i].actiontype,
					"lastmodifiedtime": bah_activeObjectList[i].lastmodifiedtime
			};
			txnlogList.push(txnlog);			
		}
	}
	return txnlogList;
}
function bah_processingIncoming(txnlogList) {
	console.log("bah_processingIncoming: txnlogList="+txnlogList);
	if (!txnlogList) {
		return null;
	}
	var i, j, k = 0;
	var moduleList = [];
	var tempInsertUpdateTxnlogList = [];
	var tempDeleteTxnlogList = [];
	var currentPackageid=null;
	var currentParentid=null;
	var currentObjecttype= bah_OBJECT_TYPE_DEFAULT;
	var currentObjectsubtype= bah_OBJECT_SUBTYPE_DEFAULT;
	
	for (i=0; i<txnlogList.length; i++) {
		//console.log("bah_processingIncoming: txnlogList[i].parentid="+txnlogList[i].parentid);
		//console.log("bah_processingIncoming: txnlogList[i].jsnstr="+txnlogList[i].jsnstr);
		//parent child array
		if (txnlogList[i].parentid) {
			currentPackageid =  txnlogList[i].packageid;
			currentParentid =  txnlogList[i].parentid;
			currentObjecttype = txnlogList[i].objecttype;
			currentObjectsubtype = txnlogList[i].objectsubtype;
			if (txnlogList[i].actiontype==bah_ACTION_TYPE_DELETE) 
				tempDeleteTxnlogList.push(txnlogList[i]);
			else if (txnlogList[i].actiontype==bah_ACTION_TYPE_INSERTORUPDATE)
				tempInsertUpdateTxnlogList.push(txnlogList[i]);
		}
		//single object
		else {
			var txnlog = bah_getObjectFromStorage(txnlogList[i].objectid, txnlogList[i].objectsubid, txnlogList[i].packageid, txnlogList[i].objecttype, txnlogList[i].objectsubtype);
			if (txnlog==null && txnlogList[i].actiontype==bah_ACTION_TYPE_INSERTORUPDATE) 
				bah_setObjectFromStorage(txnlogList[i].objectid, txnlogList[i].objectsubid, txnlogList[i].packageid, txnlogList[i].objecttype, txnlogList[i].objectsubtype, txnlogList[i]);
			else if (txnlog!=null && txnlogList[i].actiontype==bah_ACTION_TYPE_DELETE)
				bah_removeObjectFromStorage(txnlogList[i].objectid, txnlogList[i].objectsubid, txnlogList[i].packageid, txnlogList[i].objecttype, txnlogList[i].objectsubtype);
			else if (txnlog!=null && txnlogList[i].actiontype==bah_ACTION_TYPE_INSERTORUPDATE)
				bah_setObjectFromStorage(txnlogList[i].objectid, txnlogList[i].objectsubid, txnlogList[i].packageid, txnlogList[i].objecttype, txnlogList[i].objectsubtype, txnlogList[i]);
			var module = null;
			
			if (txnlogList[i].actiontype==bah_ACTION_TYPE_DELETE)
				module = bah_removeFromActiveObjectListWithObject(txnlogList[i].objectid, txnlogList[i].objectsubid, txnlogList[i].packageid, txnlogList[i].objecttype, txnlogList[i].objectsubtype);
			else
				module = bah_updateActiveObjectListWithObject(txnlogList[i].objectid, txnlogList[i].objectsubid, txnlogList[i].packageid, txnlogList[i].objecttype, txnlogList[i].objectsubtype, txnlogList[i].lastmodifiedtime);
			if (module!=null)
				bah_pushWithoutDup(moduleList, module);
		}
		
		//completing list
		if (currentParentid && (i+1==txnlogList.length || txnlogList[i+1].parentid!=currentParentid)) {
			//retrieve existing objectlist from localStorage
			var localStorageTxnlogList =
				bah_getObjectListFromStorage(currentParentid, currentPackageid, currentObjecttype, currentObjectsubtype);
			//parentid not found in localStorage
			if (localStorageTxnlogList==null && tempInsertUpdateTxnlogList.length>0) {
				bah_setObjectListFromStorage(currentParentid, currentPackageid, currentObjecttype, currentObjectsubtype, tempInsertUpdateTxnlogList);
			}
			//parentid found in localStorage
			else {
				
				//deleting
				var tempLocalStorageTxnlogList = [];
				for (j=0; j<localStorageTxnlogList.length; j++) {
					var found = 0;
					for (k=0; k<tempDeleteTxnlogList.length; k++) {
						if (tempDeleteTxnlogList[k].packageid==localStorageTxnlogList[j].packageid &&
							tempDeleteTxnlogList[k].objectid==localStorageTxnlogList[j].objectid &&
							tempDeleteTxnlogList[k].objectsubid==localStorageTxnlogList[j].objectsubid &&
							tempDeleteTxnlogList[k].objecttype==localStorageTxnlogList[j].objecttype &&
							tempDeleteTxnlogList[k].objectsubtype==localStorageTxnlogList[j].objectsubtype
						){
							found = 1;
						}
					}
					if (found==0) {
						tempLocalStorageTxnlogList.push(localStorageTxnlogList[j]);
					}
				}
				localStorageTxnlogList = tempLocalStorageTxnlogList;
				//updating
				var newTxnlogList = [];
				for (j=0; j<tempInsertUpdateTxnlogList.length; j++) {
					var found = 0;
					for (k=0; k<localStorageTxnlogList.length; k++) {
						if (tempInsertUpdateTxnlogList[j].packageid==localStorageTxnlogList[k].packageid &&
							tempInsertUpdateTxnlogList[j].objectid==localStorageTxnlogList[k].objectid &&
							tempInsertUpdateTxnlogList[j].objectsubid==localStorageTxnlogList[k].objectsubid &&
							tempInsertUpdateTxnlogList[j].objecttype==localStorageTxnlogList[k].objecttype &&
							tempInsertUpdateTxnlogList[j].objectsubtype==localStorageTxnlogList[k].objectsubtype
						){
							//updating
							found = 1;
							localStorageTxnlogList[k] = tempInsertUpdateTxnlogList[j];
							break;
						}
					}
					//inserting
					if (found==0) {
						newTxnlogList.push(tempInsertUpdateTxnlogList[j]);
					}
				}
				//inserting
				for (j=0; j<newTxnlogList.length; j++) {
					localStorageTxnlogList.push(newTxnlogList[j]);
				}
				//updating active object list
				var module = bah_updateActiveObjectListWithObjectList(currentParentid, currentPackageid, currentObjecttype, currentObjectsubtype, localStorageTxnlogList);
				if (module!=null)
					bah_pushWithoutDup(moduleList, module);
				//saving to localStorage
				bah_getObjectListFromStorage(currentParentid, currentPackageid, currentObjecttype, currentObjectsubtype, localStorageTxnlogList);
			}
			tempInsertUpdateTxnlogList = [];
			tempDeleteTxnlogList = [];
			currentPackageid=null;
			currentParentid=null;
			currentObjecttype= bah_OBJECT_TYPE_DEFAULT;
			currentObjectsubtype= bah_OBJECT_SUBTYPE_DEFAULT;
		}
	}
	return moduleList;
}