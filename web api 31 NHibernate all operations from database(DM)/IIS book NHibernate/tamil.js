var headings=['Isbn','Title','Subtitle','Author','Publisher','Pages','Description','Website'];  //stores the all the headings to be displayed in the web page
var isSearchInProgress=0;              //saves the state of search button, whether it has been pressed or not
var noOfSearchResults=0;               //number of search results matched
var isEditKeyPressed=0;                //sets when an edit button is pressed resets when it is released
var editOrDeleteButtonRow=null;        //stores the row element of the eidt or delete buttons pressed
var butShowSearchToggle=0;             //used to toggle the 'Show search' button
var noOfElementsInTheArray=0;          //stores the number of elements present at any given point in database
var butShowFormToggle=0;               //used to toggle 'Show form' button
var arrayObject;                       //main data array
var temporaryDatabase=new Array();     //it stores a copy of main array when web page is first loaded 
const apiUrl="http://localhost:7000/book/details";
var buttonTopMargin=40;                //used to indicate the top margins for 'Show search' and 'Show form' buttons
var headingReceivedSortingEvent=null;  //stores the header('th') received the sorting action
var sortingDecision=0;                 //decides whether the table is to be sorted in ascending or descending order
var isNewColumnAdded=false;            //sets every time a new column is added
var searchingForTheString;             //stores the string needs to be searched
var searchingForHeading;               //stores the heading under which searching is done

/** Adding the edit and delete buttons as last headings */
headings[headings.length]='Edit';
headings[headings.length]='Delete';

window.onload=function(){
    GetRequestForFirstLoad(apiUrl);
}

function refillDataRows(){
    noOfElementsInTheArray=0;
    let trs=document.getElementsByTagName('tr');
    let len=trs.length;
    for(let i=1; i<len; i++){
        trs[1].remove();
    }
    addFewElementsDefault();
    addCountRow(noOfElementsInTheArray);
}

function sendJsonToServerForAddAndEdit(array, url){
    let xhr=new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data=JSON.stringify({"Isbn":array[0], "Title":array[1], "Subtitle":array[2],"Author":array[3],"Publisher":array[4],"Pages":array[5], "Description":array[6], "Website":array[7]});
    xhr.send(data);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==XMLHttpRequest.DONE && xhr.status==200){
            let arr=xhr.responseText;
            arrayObject=JSON.parse(arr);
            refillDataRows();
            if(isEditKeyPressed==1){
                isEditKeyPressed=0;
                afterUpdateEvents();
            }
        }
    }
}

function sendJsonToServerForSearchFollowedByUpdate(array, url){
    let xhr=new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data=JSON.stringify({"Isbn":array[0], "Title":array[1], "Subtitle":array[2],"Author":array[3],"Publisher":array[4],"Pages":array[5], "Description":array[6], "Website":array[7]});
    xhr.send(data);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==XMLHttpRequest.DONE && xhr.status==200){
            isEditKeyPressed=0;
            document.getElementById('cancel').remove();
            sendJsonToServerSideForSearch([searchingForTheString],"http://localhost:7000/book/search/"+searchingForHeading);
        }
    }
}

function sendJsonToServerOnDelete(array,url){
    let xhr=new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data=JSON.stringify({"searchString":array[0]});
    xhr.send(data);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==XMLHttpRequest.DONE && xhr.status==200 ){
            if(isSearchInProgress==0){
                let data=xhr.responseText;
                arrayObject=null;
                arrayObject=JSON.parse(data);
                refillDataRows();
            }
            else{
                sendJsonToServerSideForSearch([searchingForTheString], "http://localhost:7000/book/search/"+searchingForHeading);
            }
        }
    }
}

function sendJsonToServerSideForSearch(array, url){
    let xhr=new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var data=JSON.stringify({"searchString":array[0]});
    xhr.send(data);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==XMLHttpRequest.DONE && xhr.status==200){
            let arr=xhr.responseText;
            arrayObject=JSON.parse(arr);
            refillDataRows();
        }
    }
}

/** clears all text fields of the input form */
function clearInputFormValues(){
    for(let i=0; i<headings.length-2; i++){
        document.getElementById(headings[i]).value='';
    }
}

/** Resets the properties of 'Edit' button */
function normalEditButtonProperties(button){
    Object.assign(button.style,{color:'white', backgroundColor:'blueviolet'});
    button.innerHTML='Edit';
}

/** makes the input form appear or disappear */
function onClickButtonShowForm(DisplayPro,MarginTopPro,InnerHTMLEle){
    Object.assign(document.getElementById('k1').style,{display:DisplayPro});
    Object.assign(document.getElementById('but_show_search').style,{marginTop:MarginTopPro});
    Object.assign(document.getElementById('but_show_form').style,{marginTop:MarginTopPro});
    document.getElementById('but_show_form').innerHTML=InnerHTMLEle;
}

/** 
 * clears input text form values
 * makes the input form disappear
 * restores the properties of edit button
 */
function cancelButton(rowElement){
    butShowFormToggle=0;
    let cells=rowElement.childNodes;
    let buttons=cells[headings.length-2].childNodes;/** stores the edit button elements present in the row that has been in editing*/
    document.getElementById('but_add').innerHTML='Add data';
    Object.assign(document.getElementById('but_add').style,{color:'white'});
    isEditKeyPressed=0;
    document.getElementById('cancel').remove();
    onClickButtonShowForm('none','0px','Show form');
    normalEditButtonProperties(buttons[0]);
    clearInputFormValues();
}

/** Anonymous function to call the event handler function for 'cancel' button */
function cancelButtonAnonymous(rowElement){
    cancelButton(rowElement);
}

/** sets either the edit or delete button properties based on the parameters passed*/
function settingEditAndDeleteProperties(Element,Id,InnerHTMLEle,ColorPro,CursorPro,BorderPro,BackgroundColorPro,BorderRadiusPro,PaddingPro,MarginLeftPro){
    Element.id=Id;
    Element.innerHTML=InnerHTMLEle;
    Object.assign(Element.style,{color:ColorPro,cursor:CursorPro,border:BorderPro,backgroundColor:BackgroundColorPro,borderRadius:BorderRadiusPro,padding:PaddingPro,marginLeft:MarginLeftPro});
}

/**Makes the cell data availabale in the form for editing and disables 'Delete' button in all rows */
function editOption(rowElement){
    if(isEditKeyPressed==0){
        butShowFormToggle=1;
        onClickButtonShowForm('block',buttonTopMargin+'px','Hide form');//makes the input form visible
        let cells=rowElement.childNodes;
        editOrDeleteButtonRow=rowElement;//stores the row element which edit button has been pressed
        isEditKeyPressed=1;
        settingEditAndDeleteProperties(cells[headings.length-2].childNodes[0],'', 'Updating', 'white', 'pointer','none','darkcyan','5px','4px','0px');
        /** Copies the particular cell data to the form */
        for(let i=0;i<headings.length-2; i++){
            document.getElementById(headings[i]).value=cells[i].innerHTML;
        }
        document.getElementById('but_add').innerHTML='Save';
        Object.assign(document.getElementById('but_add').style,{color:'white'});
        let cancelButton=createButton();
        /** Setting the properties of 'Cancel' button for the first time */
        settingEditAndDeleteProperties(cancelButton,'cancel','Cancel','white','pointer','none','darkgreen','5px','4px','5px');
        let divElement=document.getElementById('k2');
        divElement.appendChild(cancelButton);
        /** ATtaching the event listener for the 'Cancel' button */
        document.getElementById('cancel').addEventListener('click', function(){cancelButtonAnonymous(rowElement)});
    }
    /** Shows warning for an attempt to press any other delete buttons except the one that was pressed */
    else if(isEditKeyPressed==1 && rowElement!=editOrDeleteButtonRow){
        alert('Another updation is in process');
    }
}

/** Makes the delete confirmation alert visible and disables pointer events for the form*/
function deleteButton(rowElement){
    if(isEditKeyPressed==0){
        Object.assign(document.getElementById('complete_div').style,{display:'block', filter:'blur(8px)', pointerEvents:'none'});
        Object.assign(document.getElementById('popup').style,{display:'block'});
        editOrDeleteButtonRow=rowElement;
    }
    /**If any edit key was pressed befor throws a warning */
    if(isEditKeyPressed==1){
        alert('Can\'t delete entries while updating');
    }
}

/** Anonymous function to call the event handler function for the edit button*/
function editButtonAnonymous(rowElement){
    editOption(rowElement);
}

/** Anonymous function to call the event handler function for the delete button*/
function deleteButtonAnonymous(rowElement){
    deleteButton(rowElement);
}

/** 
 * creates a table row and adds data into the cells
 * clears input forms
 * Attaches event handlers for the edit and delete buttons
 */
function createAndAppendRow(){
    let rowElement=createRow();//stores the returned row element
    let table=document.getElementsByTagName('table');
    table[0].appendChild(rowElement);
    document.getElementById('complete_div').appendChild(table[0]);
    clearInputFormValues();
    rowElement.childNodes[headings.length-2].childNodes[0].addEventListener('click', function(){editButtonAnonymous(rowElement)});
    rowElement.childNodes[headings.length-1].childNodes[0].addEventListener('click',function(){deleteButtonAnonymous(rowElement)});
}

/** Renders table from the existing data in the array */
function addFewElementsDefault(){
    for(let i=0; i<arrayObject.length; i++){
        createAndAppendRow();
        noOfElementsInTheArray++;//increments whenever a new row is added
    }    
}    

/** Creates a new 'TR' element and appends it to the last 'TR' element of the table which displays the total number of elements whether in search results or in database*/
function addCountRow(resultCount){
    let rowElement=document.createElement('tr');
    let cell=document.createElement('td');
    let txt;
    if(isSearchInProgress==1){
        txt=document.createTextNode('Number of matches: '+resultCount);
    }
    else{
        txt=document.createTextNode('Count: '+resultCount);
    }    
    cell.appendChild(txt);
    rowElement.appendChild(cell);
    let table=document.getElementsByTagName('table');
    table[0].appendChild(rowElement);
    document.getElementById('complete_div').appendChild(table[0]);
    rowElement.id='count';//creates a new id for the 'count' row element
    cell.colSpan=headings.length;
    Object.assign(cell.style,{textAlign:'center',backgroundColor:'gray',color:'black'});
}

/** 
 * Creates input form and search tab
 * renders the table in the web page
 */
function onloadEvents(){
    noOfElementsInTheArray=0;
    buttonTopMargin=40;
    document.getElementById('Search').placeholder=headings[0];
    /** Creates labels for the form based on the number of headings except 'Edit' and 'Delete' */
    for(let i=0; i<headings.length-2; i++){
        createFormTextAndLabels(i);
    }    
    /** Creates new option each for one heading and adds it to the select dropdown */
    for(let i=0; i<headings.length-2; i++){
        let option=document.createElement('option');
        option.innerHTML=headings[i];
        option.value=headings[i];
        document.getElementById('but_select').appendChild(option);
    }    
    createTableHeadings();
    addFewElementsDefault();
    addCountRow(arrayObject.length);
}    

/** Anonymous function to call the event handler for the headers */
function hoverAnonymous(header){
    onHoveringArrow(header);
}    

/** 
 * changes the color of the hovered header
 * Makes the arrow inline
 */
function onHoveringArrow(header){
    Object.assign(header.style,{backgroundColor:'burlywood'});
    let iS=header.getElementsByTagName('i');
    Object.assign(iS[0].style,{display:'inline'});
}    

/** 
 * Anonymous function to call the onmouse event handler function for the header 
 */
function onMouseOutAnonymous(header){
    onMouseOut(header);
}    

/** 
 * Resets the color of the header
 * Makes arrow disappear for headers other than the one based on which the table is sorted
 */
function onMouseOut(header){
    Object.assign(header.style,{backgroundColor:'lightblue'});
    let iS=header.getElementsByTagName('i');
    /** If the header is not the one which is uesd for sorting then make it arrow disappear */
    if(header!=headingReceivedSortingEvent ){
        Object.assign(iS[0].style,{display:'none'});
    }    
}    

function refreshingPage(){
    let tables=document.getElementsByTagName('table');
    let form=document.getElementById('data_form');
    let labels=form.childNodes;
    var x;
    if(isNewColumnAdded){
        x=3;
    }
    else{
        x=2;
    }
    /** Removes the lables and text fields in the form */
    for(let i=0; i<(headings.length-x)*4; i++){
        labels[0].remove();
    }    
    form=document.getElementById('but_select');
    labels=form.childNodes;
    /** Removes the options from the select dropdown  */
    for(let i=0; i<headings.length-x; i++){
        labels[0].remove();
    }    
    tables[0].remove();//Removes entire table from the DOM
    isNewColumnAdded=false;
}

/** 
 * Checks for duplicate headers(columns)
 * Adds the newly added heading into the 'headings' array
 * Sets the value for the newly added key(header-column) to '-'
 * clears the form and the table and renders new ones with the new header
 */
function addNewColumn(){
    if(document.getElementById('add_column_value').value!=''){
        if(isEditKeyPressed==0){
            let isDuplicateColumnAdded=false;
            let column=document.getElementById('add_column_value').value;
            /** Checks if the entered column value is already present in the 'headings' array */
            for(let i in headings){
                if(column==headings[i]){
                    isDuplicateColumnAdded=true;
                }    
            }    
            /** Executes if the new column entered is a unique one */
            if(!isDuplicateColumnAdded){
                let temp1, temp2;
                temp1=headings[headings.length-2];
                temp2=headings[headings.length-1];
                let colPos=headings.length-2;
                headings[colPos]=column;
                headings[colPos+1]=temp1;
                headings[colPos+2]=temp2;
                /** Sets the value for the newly added key(header-column) to '-' */
                for(let i=0; i<temporaryDatabase.length; i++){
                    arrayObject[i][column]='-';
                    temporaryDatabase[i][column]='-';
                }    
                isNewColumnAdded=true;
                refreshingPage();
                onloadEvents();
            }    
            else{
                alert('Column already exists');
            }    
        }    
        else{
            alert('Updation in progress');
        }    
    }    
    document.getElementById('add_column_value').value='';//Rsets the column value to empty
}    

/** Creates label and text fields for the form */
function createFormTextAndLabels(index){
    let label=document.createElement('label');
    label.innerHTML=headings[index];
    let input=document.createElement('input');
    input.type='text';
    input.id=headings[index];
    input.value='';
    input.placeholder=headings[index];
    let appendOn=document.getElementById('data_form');
    appendOn.appendChild(label);
    appendOn.appendChild(input);
    /** Adds <br> elements inbetween the text elements for line breaks */
    for(let i=0; i<2; i++){
        appendOn.appendChild(document.createElement('br'));
    }    
    buttonTopMargin+=40;
}    

/** 
 * Appends arrows to the headers and attaches respective events to them
 */
function insertingArrows(header){
    let i=document.createElement('i');
    Object.assign(header.style,{position:'relative'});
    header.appendChild(i);
    i.classList='fa';
    i.innerHTML='&#xf137';
    Object.assign(i.style,{display:'none'});
    i.addEventListener('click', function(){sortingAnonymous(header)});           //adding click event for the arrows
    header.addEventListener('mouseover', function(){hoverAnonymous(header)});    //adding 'mouseover' event for the headers
    header.addEventListener('mouseout', function(){onMouseOutAnonymous(header)});//adding 'mouseout' event for the headers
}    

/** Creates table headers and adds them to the DOM */
function createTableHeadings(){
    let table;
    let rowElement;
    let header;
    table=document.createElement('table');
    rowElement=document.createElement('tr');
    /** Creating headings and appending them to DOM */
    for(let i=0; i<headings.length; i++){
        header=document.createElement('th');
        header.appendChild(document.createTextNode(headings[i]));
        rowElement.appendChild(header);
        /** Adding arrows to all headers except the 'Edit' and 'Delete' headers */
        if(i<headings.length-2){
            insertingArrows(header);
        }    
    }    
    table.appendChild(rowElement);
    document.getElementById('complete_div').appendChild(table);//Appending the table element to the 'complete_div' div element
}    

/** Anonymous function to call the event handler function, sorting of the arrows */
function sortingAnonymous(header){
    sorting(header);
}    

/** Decides the sorting type and the arrow type */
function arrowPositionAndSortingDecision(eventHeading,decision,arrowPos){
    sortingDecision=decision;
    let iS=eventHeading.getElementsByTagName('i');
    iS[0].innerHTML=arrowPos;//changes the direction of the arrow
}    

/** 
 * Resets the table to the state before sort 
 * Changes uparrow to a neutral left directed bold arrow
 */
function resetTable(heading){
    if(isSearchInProgress==0){
        GetRequestForOtherLoads(apiUrl);
    }
    else if(isSearchInProgress==1){
        sendJsonToServerSideForSearch([searchingForTheString],"http://localhost:7000/book/search/"+searchingForHeading);
    }
    sortingDecision=0;
    let iS=document.getElementsByTagName('i');
    /** Changes all up and down arrows of the headers to a neutral left directed bold arrow */
    for(let i=0; i<iS.length; i++){
        iS[i].innerHTML='&#xf137';
    }    
    headingReceivedSortingEvent=null; //Clears the variable to indicate the table is not in ascending or descending order
}    

/** 
 * Main sorting event handler function for all the 3 arrows 
 */
function sorting(header){
    if(isEditKeyPressed==0){
        let heading;
        headingReceivedSortingEvent=header;
        /** Hides arrows of all headers */
        for(let i=0; i<headings.length-2; i++){
            let iS=document.getElementsByTagName('i');
            Object.assign(iS[i].style,{display:'none'});
        }    
        let iS=header.getElementsByTagName('i');
        Object.assign(iS[0].style,{display:'inline'});
        /** Only ascending or descending sort is done here */
        if(sortingDecision==0 || sortingDecision==1){
            heading=headings[header.cellIndex];
        }
        if(sortingDecision==1){
            if(isSearchInProgress==0){
                GetRequestForOtherLoads("http://localhost:7000/book/sort/"+heading+"/asc");
            }
            else if(isSearchInProgress==1){
                sendJsonToServerSideForSearch([searchingForTheString],"http://localhost:7000/book/sortselected/"+heading+"/"+searchingForHeading+"/asc");
            }
            arrowPositionAndSortingDecision(header,2,'&#xf107');
        }        
        else if(sortingDecision==0){
            if(isSearchInProgress==0){
                GetRequestForOtherLoads("http://localhost:7000/book/sort/"+heading+"/desc");
            }
            else if(isSearchInProgress==1){
                sendJsonToServerSideForSearch([searchingForTheString],"http://localhost:7000/book/sortselected/"+heading+"/"+searchingForHeading+"/desc");
            }
            arrowPositionAndSortingDecision(header,1,'&#xf106');
        }    
        else if(sortingDecision==2){
            resetTable(heading);
        }    
    }
    else if(isEditKeyPressed==1){
        alert('Updation in progress');
    }
}    

/** 
 * Gives alert if any of the text fields in the form is left empty
 * Blurs elements other than the alert one and disbales pointer events for the same  
 */
function onNotValidForm(){
    /** Blurs all the elements but the alert one and disables pointer events */
    Object.assign(document.getElementById('complete_div').style,{display:'block', filter:'blur(8px)', pointerEvents:'none'});

    Object.assign(document.getElementById('popup1').style,{display:'block'});//Makes the alert box appear in the DOM
    let inputs=document.getElementById('data_form').getElementsByTagName('input');
    /** Copies the name of the lables that are empty to the alert box */
    for(let i=0; i<inputs.length; i++){
        if(inputs[i].value==''){
            document.getElementById('empty_fields').appendChild(document.createTextNode(inputs[i].id));
            document.getElementById('empty_fields').appendChild(document.createElement('br'));
        }
    }
}

/** 
 * Removes the alert that raised for 'notValidForm' 
 * Makes the elements inside the 'Complete_div' 'div' element clear and 'pointerEvents' all 
 */
function okOnEmptyForm(){
    Object.assign(document.getElementById('complete_div').style,{display:'block', filter:'blur(0px)', pointerEvents:'all'});
    Object.assign(document.getElementById('popup1').style,{display:'none'});
    let emps=document.getElementById('empty_fields').childNodes;
    let len=emps.length;
    /** Removes name of all empty form fields from the alert box so that it can be shown fresh the next time with new empty fields */
    for(let i=0; i<len; i++){
        emps[0].remove();
    }
}

/** 
 * Returns true only if all the form fields are filled
 * Returns false if atleast one of the form fields is empty
 */
function isFormFilled(valueArray){
    for(let i=0; i<valueArray.length; i++){
        if(valueArray[i]==""){
            return true;
        }
    } 
    return false;
}

/** 
 * Copies values of all the form fields and returns them as an array
 */
function getValuesFromForm(){
    let valueArray=new Array();
    for(let index in headings){
        valueArray[index]=document.getElementById(headings[index]).value;
        /** Breaks out of the loop before 'Edit' heading in the 'headings' array */
        if(index==headings.length-3){
            break;
        }
    }
    return valueArray;
}

/** 
 * Changes the 'innerHTML' of the 'Search' button based on toggling
 */
function propertiesOfSearch(InnerHTML){
    document.getElementById('but_search').innerHTML=InnerHTML;
    Object.assign(document.getElementById('but_search').style,{color:'white'});
}

/** 
 * Clears the text field of search box
 * Changes the text of the 'Cancel search' button
 * Makes all of the row elemets in table reappear 
 */
function  cancelSearch(){
    GetRequestForOtherLoads(apiUrl);    
    propertiesOfSearch('Search');
    isSearchInProgress=0;
    document.getElementById('Search').value=''; //clears text field of the search box
}

function afterUpdateEvents(){
    document.getElementById('but_add').innerHTML='Add data';
    Object.assign(document.getElementById('but_add').style,{color:'white'});
    let rowElement=editOrDeleteButtonRow;
    let cells=rowElement.childNodes;
    let buttons=cells[headings.length-2].childNodes;
    normalEditButtonProperties(buttons[0]);
    clearInputFormValues();
    document.getElementById('cancel').remove();
}

function GetRequestForFirstLoad(theUrl) {
    fetch(theUrl).then(res=>res.json()).then(
        (response) => {
            arrayObject=null;
            arrayObject=response;
            onloadEvents();
        }
    );
}

function GetRequestForOtherLoads(theUrl) {
    fetch(theUrl).then(res=>res.json()).then(
        (response) => {
            arrayObject=null;
            arrayObject=response;
            refillDataRows();            
        }
    );
}

/** 
 * Event handler function for the 'Save' and 'Add' button
 * Copies the values from the form and applies it to the 'updating' row or a new row is created in the table with the form values
 */
function buttonAddRow(){
    /** If the table is currrently sorted by then, the table is reset to non-sorted order  */
    if(headingReceivedSortingEvent!=null){
        sortingDecision=0;
        let iS=headingReceivedSortingEvent.getElementsByTagName('i');
        Object.assign(iS[0].style,{display:'none'});
        resetTable(); //rsets the table
    }
    /** If none of the 'Edit' buttons were pressed previoulsy then a new row is appended to the last before the count row in the table with values from the form fields */
    if(isEditKeyPressed==0){
        let valueArray=getValuesFromForm();//stores the values from the form fields as an array
        /** Checks if the form is filled or not */
        if(isFormFilled(valueArray)){
            onNotValidForm();
        }
        /** Executes if all the form fields are filled */
        else{
            /** Searching is cancelled before adding a new row into the table */
            if(isSearchInProgress==1){
                cancelSearch();
            }
            /*------------------------*/
            sendJsonToServerForAddAndEdit(valueArray,"http://localhost:7000/book/addData");            
            /*------------------------*/
        }
    }
    
    /** Executed if any of the 'Edit' buttons were pressed */
    else if(isEditKeyPressed==1){
        let valueArray=getValuesFromForm();
        /** Checks if all the form fields are filled or not */
        if(isFormFilled(valueArray)){
            onNotValidForm();
        }
        
        /** Executes if all the form fields are filled */
        else{
            onClickButtonShowForm('none','0px','Show form'); //Makes the form disappear
            let valueArray=getValuesFromForm();
            /*----------------*/
            let id=arrayObject[editOrDeleteButtonRow.rowIndex-1]['Id'];
            if(isSearchInProgress==1){
                sendJsonToServerForSearchFollowedByUpdate(valueArray, "http://localhost:7000/book/update/"+id);
            }
            else if(isSearchInProgress==0){
                sendJsonToServerForAddAndEdit(valueArray,"http://localhost:7000/book/update/"+id);
            }
            /*----------------*/
        }
    }
}

/** 
 * Creates and returns a button element
 */
function createButton(){
    let button=document.createElement('button');
    return button;
}

/** 
 * Creates a new row
 * Adds input form text fields into newly created cells
 * Attaches event listeners for 'Edit' and 'Delete' buttons and sets their properties 
 */
function createRow(){
    let rowElement=document.createElement('tr');
    let cell=new Array(headings.length);
    for(let i=0; i<headings.length; i++){
        cell[i]=document.createElement('td');
    }   
    let button1=createButton();
    let button2=createButton();
    let valueArray=new Array(headings.length-2);
    let valueIndex=0;
    for(let index=0; index<headings.length-2; index++){
        for(let i in arrayObject[noOfElementsInTheArray]){
            if(i==headings[index]){
                valueArray[valueIndex]=document.createTextNode(arrayObject[noOfElementsInTheArray][i]);
                break;
            }
        }
        valueIndex++;
    }
    for(let i=0; i<valueArray.length; i++){
        cell[i].appendChild(valueArray[i]);
    }
    cell[headings.length-2].appendChild(button1);
    cell[headings.length-1].appendChild(button2);
    for(let i=0; i<headings.length; i++){
        rowElement.appendChild(cell[i]);
    }
    let cells=rowElement.childNodes;
    settingEditAndDeleteProperties(cells[headings.length-2].childNodes[0],'', 'Edit', 'white', 'pointer','none','blueviolet','5px','4px','0px');
    settingEditAndDeleteProperties(cells[headings.length-1].childNodes[0],'', 'Delete', 'white', 'pointer','none','darkgreen','5px','4px','0px');
    return rowElement;
}

/** 
 * This function either makes the search tab appear or disappear based on the parameters passed
 */
function showButtonSearchEvents(ToggleValue, DisplayPro, InnerHTML){
    butShowSearchToggle=ToggleValue;
    Object.assign(document.getElementById('div1').style,{display:DisplayPro});
    document.getElementById('but_show_search').innerHTML=InnerHTML;
}

/** 
 * Passes parameters to 'showButtonSearchEvents' based on the search button toggle values
 */
function showButtonSearch(){
    if(butShowSearchToggle==0){
        showButtonSearchEvents(1,'block','Hide search');
    }
    else if(butShowSearchToggle==1){
        showButtonSearchEvents(0,'none','Show search');
    }
}

/** 
 * This is the event handler function for the 'select' button in the search tab
 */
function select(){
    document.getElementById('Search').placeholder=document.getElementById('but_select').value;
}

/** 
 * Passes parameters to 'onClickButtonShowForm' function to either make the form appear or disappear   
 */
function buttonShowForm(){
    if(butShowFormToggle==0){
        butShowFormToggle=1;
        onClickButtonShowForm('block',buttonTopMargin+"px",'Hide form');
    }
    else if(butShowFormToggle==1){
        butShowFormToggle=0;
        onClickButtonShowForm('none','0px','Show form');
    }
}

/** 
 * Event handler function for the 'cancel' button
 * Makes the delete alert box disappear
 * Makes all the elements inside 'complete_div' reappear and sets thier pointer events to 'all'
 */
function deleteCancel(){
    document.getElementById('popup').style.display='none';
    editOrDeleteButtonRow=null;
    Object.assign(document.getElementById('complete_div').style,{display:'block', filter:'blur(0px)', pointerEvents:'all'});
}

/** 
 * Event handler function for the 'confirm' button in the delete tab
 * Removes the targetted array element from both the main and the temporary array
 * Removes the corresponding row element from the DOM
 */
function deleteConfirm(){
    Object.assign(document.getElementById('complete_div').style,{display:'block', filter:'blur(0px)', pointerEvents:'all'});
    /*-----------------*/
    let id=arrayObject[editOrDeleteButtonRow.rowIndex-1]['Id'];
    sendJsonToServerOnDelete([id], "http://localhost:7000/book/delete");
    /*-----------------*/
    Object.assign(document.getElementById('popup').style,{display:'none'});
}

/** 
 * Event handler function for the 'Search' button
 */
function searchFunction(){
    searchingForHeading=document.getElementById('but_select').value;
    searchingForTheString=document.getElementById('Search').value;
    /** Searching happens if none of the 'Edit' buttons were pressed */
    if(isEditKeyPressed==0){
        if(isSearchInProgress==0 && searchingForTheString!=''){
            propertiesOfSearch('Clear Search');
            noOfSearchResults=0;
            /*--------------------*/
            isSearchInProgress=1;
            sendJsonToServerSideForSearch([searchingForTheString],"http://localhost:7000/book/search/"+searchingForHeading);
            /*--------------------*/
            let cells=document.getElementById('count').childNodes;
            cells[0].innerHTML='Number of Matches: '+noOfSearchResults;
        }
        /** After clicking the 'Cancel search' button, all the table rows were displayed again and the 'Cancel search' button properties were changed */
        else if(isSearchInProgress==1 && searchingForHeading!=''){
            cancelSearch();
        }
    }
    else{
        alert('Updation in progress');
    }
}