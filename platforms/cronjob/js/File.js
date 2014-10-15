//CLASS DECLARATION File (syncronous)
 function File (fileName)  {  

//CLASS ATTRIBUTES
	this.fileName =		fileName,		//this is the file name	
	this.File =		undefined, 		//this is the file content	
	
//CLASS CONSTRUCTOR
	$.ajax({
		  type: "GET",
		  url: this.fileName,
		  dataType: "text",
		  context: this,
		  success: function (content){
				      this.File = content;				      
				      },
		  error : this.displayError,
		  async:   false
	});
	
	this.displayError = 	function () {	
	      console.log(":: ERROR :: upss the script could not open the files, Have you got access rights?");
	      alert(":: ERROR :: upss the script could not open the files, Have you got access rights?");	
	};// END method displayError	
	
}//END CLASS File