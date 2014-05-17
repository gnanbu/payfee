/**
 * Created by laxmanra on 7/4/2014.
 */

var app = angular.module('school',['ngRoute','UserApp','ngResource','ui.bootstrap','ajoslin.promise-tracker']).
    config(function ($routeProvider,$locationProvider){
$locationProvider.html5Mode(true);
    $routeProvider.when('/',{
        templateUrl: '/payfee/partials/studentsList.html',controller: 'schoolCtrl'
    }).when('/addStudent',{
        templateUrl: '/payfee/partials/AddStudent.html', controller: 'AddStudentCtrl'
    }).when('/editStudent/:id',{
        templateUrl: '/payfee/partials/AddStudent.html', controller: 'EditStudentCtrl'
    }).when('/payfee/:id',{
        templateUrl: '/payfee/partials/PayFee.html', controller: 'PayFeeCtrl'
        }).when('/adminupload',{
        templateUrl: '/payfee/partials/UploadStudents.html', controller: 'uploadCtrl'
    }).when('/contact-us',{
        templateUrl: '/payfee/partials/contact-us.html', controller: 'helpCtrl'
    }).otherwise({redirectTo:'/'});

        $routeProvider.when('/login', {templateUrl: '/payfee/partials/login.html',login: true});
        $routeProvider.when('/signup', {templateUrl: '/payfee/partials/signup.html', public:true});
        $routeProvider.otherwise({redirectTo: '/'});
})

app.run(function($rootScope,user) {
    user.init({ appId: '53441326d7e76' });
   user.role= UserApp.Permission.get({
        "permission_id": "admin"
    }, function(error, result){
        // Handle error/result

    });
    $rootScope.students= [];
    $rootScope.o=[];

});

app.factory('FeeService',['$resource',function($resource){
    return $resource('http://localhost:8080/school-ws/api/school/fee',{},{
        query: {
            method: 'GET',
            isArray: false,
            params: {}
        },
        save:   {method:'POST'}
    });
}]);

app.factory('SchoolService',['$resource',function($resource){

    return $resource('http://16.162.70.242:8080/payFee/api/payfeeservice/getSchool',{},{query:{  method:'JSONP'}});
}]);

app.factory('StudentService',['$http',function($http){

//    return $resource('http://16.162.70.242:8080/payFee/api/payfeeservice/getStudentsListForUser',{q:'@parentEmailId'},
//        {query:
//            {
//                   method:'JSONP',
//                isArray:true
//            }
//        });
    return {
        getJson:function(){
            return $http.get('http://16.162.70.242:8080/payFee/api/payfeeservice/getStudentsListForUser?q:')
        }
    }


}]);

 function PayFeeCtrl($scope,$location,$routeParams ) {
     $scope.student=$scope.students[$routeParams.id];
     $scope.payFee = function()
     {
         $location.path('/');
     }
}

function AddStudentCtrl ($scope,$location,FeeService,$http) {

     $scope.student={name:"", standard:"",schoolName:"",schoolId:"", id:"",parentEmailId:"",previousStudentId:""}
     $scope.student.schoolName="0";
     $scope.student.standard="0";
    $scope.name = ''; // This will hold the selected item
    $scope.onItemSelected = function() { // this gets executed when an item is selected
        console.log('selected=' + $scope.schoolId);
    };

    $scope.save = function()
    {
      console.log("inside save"+ $scope.student.id);
        $scope.student.parentEmailId= $scope.user.email;
        $scope.students.push($scope.student);
        $http({
            method : 'POST',
            url : 'http://localhost:8080/school-ws/api/school/fee/saveStudent',
            //     url: 'http://16.162.70.242:8080/payFee/api/payfeeservice/updateStudentParentsEmail',
            data : $scope.student
        })
        $location.path('/');
    }
}

function uploadCtrl($scope,XLSXReaderService,FeeService ) {
    $scope.showPreview = false;

    $scope.fileChanged = function(files) {
        $scope.isProcessing = true;
        $scope.sheets = [];
        $scope.excelFile = files[0];
        XLSXReaderService.readFile($scope.excelFile, $scope.showPreview).then(function(xlsxData) {
            $scope.sheets = xlsxData.sheets;
            $scope.isProcessing = false;
        });
    };

    $scope.showPreviewChanged = function() {
        if ($scope.showPreview) {
            $scope.isProcessing = true;
            XLSXReaderService.readFile($scope.excelFile, $scope.showPreview).then(function(xlsxData) {
                $scope.sheets = xlsxData.sheets;
                var dataArray  = $scope.sheets['Sheet1'].data;

                $scope.isProcessing = false;
            });
        };
    };

    $scope.upload= function()
    {
        var dataArray = [];
        var jsonData;
        var iterData = $scope.sheets['Sheet1'].data;
    FeeService.save(($scope.sheets['Sheet1']).data);
    }
}

/*this factory is for xls upload*/
app.factory("XLSXReaderService", ['$q', '$rootScope',
    function($q, $rootScope) {
        var service = function(data) {
            angular.extend(this, data);
        };
        service.readFile = function(file, showPreview) {
            var deferred = $q.defer();
            XLSXReader(file, showPreview, function(data) {
                $rootScope.$apply(function() {

                    deferred.resolve(data);
                });
            });
            return deferred.promise;
        };
        return service;
    }
]);

function EditStudentCtrl($scope,$location,$routeParams,$http ) {


    $scope.student=$scope.students[$routeParams.id];
    console.log("inside edit"+$scope.student.name);
    $scope.save = function()
    {
        console.log("inside save"+ $scope.student.previousStudentId);
        $scope.student.parentEmailId= $scope.user.email;
   //     $scope.students.push($scope.student);
        $http({
            method : 'POST',
            url : 'http://localhost:8080/school-ws/api/school/fee/saveStudent',
            //     url: 'http://16.162.70.242:8080/payFee/api/payfeeservice/updateStudentParentsEmail',
            data : $scope.student
        })
        $location.path('/');
    }

}

function schoolCtrl($scope,$rootScope,FeeService,SchoolService,$http){
    $scope.myForm = {};
    //var myStudents = StudentService.query({q:$rootScope.user.email});
    var studentsList = $http.jsonp("http://16.162.70.242:8080/payFee/api/payfeeservice/getStudentsListForUser?callback=JSON_CALLBACK&q="+$rootScope.user.email).then(
        //   return $http.jsonp("http://16.162.70.242:8080/payFee/api/payfeeservice/getStudentName?callback=JSON_CALLBACK &filter=US&q="+studentName).then(
        function(response){
            $scope.students=response.data;
//            return limitToFilter(response.data, 15);
console.log(response);
            return response;
        });
    console.log(studentsList);
   // $scope.students = myStudents

// Model for your selected item
    $scope.selection;
  //  FeeService.get();
    //var schoolList = SchoolService.query();

    var schoolsList = $http.jsonp("http://16.162.70.242:8080/payFee/api/payfeeservice/getSchool?callback=JSON_CALLBACK").then(
        //   return $http.jsonp("http://16.162.70.242:8080/payFee/api/payfeeservice/getStudentName?callback=JSON_CALLBACK &filter=US&q="+studentName).then(
        function(response){
           // $scope.students=response.data;
            $scope.myForm.schools = response.data;
//            return limitToFilter(response.data, 15);
            console.log(response);
            return response;
        });

    $scope.myForm.standards= [
        {id:"0",name:"select"},{id:"1",name:"I"},{id:"2",name:"II"},{id:"3",name:"III"}
    ]


        //[{"id":37,"schoolName":"Saraswathi Vidyalaya Matriculation Higher Secondary School","standard":"1","name":"Anba","schoolId":"1000","parentEmailId":"prasath_adams@yahoo.com"},{"id":38,"schoolName":"Saraswathi Vidyalaya Matriculation Higher Secondary School","standard":"1","name":"Uma","schoolId":"1000","parentEmailId":"prasath_adams@yahoo.com"}];
   // console.log("my students "+myStudents.getLocation(0));

    $scope.deleteStudent = function(idx){
       $scope.students.splice(idx,1);

    }
}

function helpCtrl($scope, $http, $log, promiseTracker, $timeout){
    $scope.subjectListOptions = {
        'bug': 'Report a Bug',
        'account': 'Account Problems',
        'mobile': 'Mobile',
        'user': 'Report a Malicious User',
        'other': 'Other'
    };

    $scope.progress = promiseTracker('progress');
    var config = {
        params : {
            'callback' : 'JSON_CALLBACK',
            'name' : $scope.name,
            'email' : $scope.email,
            'subjectList' : $scope.subjectList,
            'url' : $scope.url,
            'comments' : $scope.comments
        },
        tracker : 'progress'
    };

    // Form submit handler.
    $scope.submit = function(form) {
        // Trigger validation flag.
        $scope.submitted = true;

        // If form is invalid, return and let AngularJS show validation errors.
        if (form.$invalid) {
            return;
        }

        // Default values for the request.
        $scope.progress = promiseTracker('progress');
        var config = {
            params : {
                'callback' : 'JSON_CALLBACK',
                'name' : $scope.name,
                'email' : $scope.email,
                'subjectList' : $scope.subjectList,
                'url' : $scope.url,
                'comments' : $scope.comments
            },
            tracker : 'progress'
        };

        // Perform JSONP request.
        $http.jsonp('http://localhost:8080/school-ws/api/school/fee/contactUs', config)
            .success(function(data, status, headers, config) {
                if (data.status == 'OK') {
                    $scope.name = null;
                    $scope.email = null;
                    $scope.subjectList = null;
                    $scope.url = null;
                    $scope.comments = null;
                    $scope.messages = 'Your form has been sent!';
                    $scope.submitted = false;
                } else {
                    $scope.messages = 'Oops, we received your request, but there was an error processing it.';
                    $log.error(data);
                }
            })
            .error(function(data, status, headers, config) {
                $scope.progress = data;
                $scope.messages = 'There was a network error. Try again later.';
                $log.error(data);
            });

        // Hide the status message which was set above after 3 seconds.
        $timeout(function() {
            $scope.messages = null;
        }, 3000);
    };
}

function TypeaheadCtrl($scope, $http,limitToFilter,$location) {
    $scope.countries = [{countryId: 0,CountryCode: "IN",CountryDesc: "India"}];
    $scope.states = [
        {StateId: 0,StateCode: "ANI",StateDesc: "Andaman and Nicobar Islands"},
        {StateId: 1,StateCode: "AP",StateDesc: "Andhra Pradesh"},
        {StateId: 2,StateCode: "ARP",StateDesc: "Arunachal Pradesh"},
        {StateId: 3,StateCode: "BI",StateDesc: "Bihar"},
        {StateId: 4,StateCode: "CH",StateDesc: "Chandigarh"},
        {StateId: 5,StateCode: "CHH",StateDesc: "Chhattisgarh"},
        {StateId: 6,StateCode: "DNH",StateDesc: "Dadra and Nagar Haveli"},
        {StateId: 7,StateCode: "DD",StateDesc: "Daman and Diu"},
        {StateId: 8,StateCode: "DE",StateDesc: "Delhi"},
        {StateId: 9,StateCode: "GO",StateDesc: "Goa"},
        {StateId: 10,StateCode: "GJ",StateDesc: "Gujarat"},
        {StateId: 11,StateCode: "HA",StateDesc: "Haryana"},
        {StateId: 12,StateCode: "HP",StateDesc: "Himachal Pradesh"},
        {StateId: 13,StateCode: "JK",StateDesc: "Jammu and Kashmir"},
        {StateId: 14,StateCode: "JH",StateDesc: "Jharkhand"},
        {StateId: 15,StateCode: "KA",StateDesc: "Karnataka"},
        {StateId: 16,StateCode: "KE",StateDesc: "Kerala"},
        {StateId: 17,StateCode: "LK",StateDesc: "Lakshadweep"},
        {StateId: 18,StateCode: "MP",StateDesc: "Madhya Pradesh"},
        {StateId: 19,StateCode: "MH",StateDesc: "Maharashtra"},
        {StateId: 20,StateCode: "MA",StateDesc: "Manipur"},
        {StateId: 21,StateCode: "ME",StateDesc: "Meghalaya"},
        {StateId: 22,StateCode: "MI",StateDesc: "Mizoram"},
        {StateId: 23,StateCode: "NA",StateDesc: "Nagaland"},
        {StateId: 24,StateCode: "OD",StateDesc: "Odisha"},
        {StateId: 25,StateCode: "PD",StateDesc: "Puducherry"},
        {StateId: 26,StateCode: "PU",StateDesc: "Punjab"},
        {StateId: 27,StateCode: "SI",StateDesc: "Sikkim"},
        {StateId: 28,StateCode: "TN",StateDesc: "Tamil Nadu"},
        {StateId: 29,StateCode: "TR",StateDesc: "Tripura"},
        {StateId: 30,StateCode: "UP",StateDesc: "Uttar Pradesh"},
        {StateId: 31,StateCode: "UK",StateDesc: "Uttarakhand"},
        {StateId: 32,StateCode: "WB",StateDesc: "West Bengal"}];


        /*'Madhya Pradesh','Maharashtra','Andhra Pradesh','Uttar Pradesh','Jammu and Kashmir','Gujarat','Karnataka','Odisha','Chhattisgarh','Tamil Nadu','Bihar','West Bengal','Arunachal Pradesh','Jharkhand',
        'Assam','Himachal Pradesh','Uttarakhand','Punjab','Haryana','Kerala','Meghalaya','Manipur','Mizoram','Nagaland','Tripura','Andaman and Nicobar Islands','Sikkim','Goa','Delhi','Puducherry',
        'Dadra and Nagar Haveli','Chandigarh','Daman and Diu','Lakshadweep'];*/
    // Any function returning a promise object can be used to load values asynchronously
    $scope.getLocation = function(val) {
        return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: val,
                sensor: false
            }
        }).then(function(res){
            var addresses = [];
            angular.forEach(res.data.results, function(item){
                addresses.push(item.formatted_address);
            });
            return addresses;
        });
    };

    $scope.getStudent = function(studentName) {
        //http://localhost:8080/school-ws/api/school/fee?callback=JSON_CALLBACK &filter=US&q="+studentName

        return $http.jsonp("http://localhost:8080/school-ws/api/school/fee?callback=JSON_CALLBACK &filter=US&q="+studentName).then(
     //   return $http.jsonp("http://16.162.70.242:8080/payFee/api/payfeeservice/getStudentName?callback=JSON_CALLBACK &filter=US&q="+studentName).then(
            function(response){
                $scope.o=response.data;
            return limitToFilter(response.data, 15);
        });
    };

    $scope.save = function()
    {
        console.log("inside save"+ $scope.student.id);
        $scope.student.parentEmailId= $scope.user.email;
        $scope.students.push($scope.student);
        $http({
            method : 'POST',
            url : 'http://localhost:8080/school-ws/api/school/fee/saveStudent',
       //     url: 'http://16.162.70.242:8080/payFee/api/payfeeservice/updateStudentParentsEmail',
            data : $scope.student
        })
        $location.path('/');
    }

    $scope.formatLabel = function(model) {
        console.log("inside format"+$scope.o.length);
        if($scope.o.length>0) {
            for (var i = 0; i < $scope.o.length; i++) {
                console.log("inside for" + $scope.o[i].Id);
                if (model == $scope.o[i].Name) {
                    $scope.student.id = $scope.o[i].Id;
                    $scope.student.name = $scope.o[i].Name;
                    return $scope.o[i].Name;
                }
            }
        }
        else
        {
            $scope.student.previousStudentId = $scope.student.id;
            return  $scope.student.name;
        }
    }
}

app.controller('TypeAheadController',function($scope,dataFactory){
    dataFactory.get('http://localhost:63342/payfee/angular-typeahead/states.json').then(function(data){
        $scope.items= data;
    });
    $scope.name="";
    $scope.onItemSelected=function(){
        console.log('selected='+$scope.name);
    }
});

app.factory('dataFactory', function($http) {
    return {
        get: function(url) {
            return $http.get(url).then(function(resp) {
                return resp.data;
            });
        }
    };
});