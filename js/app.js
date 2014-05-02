/**
 * Created by laxmanra on 7/4/2014.
 */

var app = angular.module('school',['ngRoute','UserApp','ngResource','ui.bootstrap','ajoslin.promise-tracker']).
    config(function ($routeProvider,$locationProvider){
$locationProvider.html5Mode(true);
    $routeProvider.when('/',{
        templateUrl: '/payfee/partials/studentsList.html',controller: 'schoolCtrl'
    }).when('/addStudent',{
        templateUrl: '/payfee/partials/AddStudent.html', controller: 'TypeaheadCtrl'
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

app.run(function($rootScope, user) {
    user.init({ appId: '53441326d7e76' });

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

    return $resource('http://16.162.70.242:8080/payFee/api/payfeeservice/getSchool',{},{});
}]);



 function PayFeeCtrl($scope,$location,$routeParams ) {
     $scope.student=$scope.students[$routeParams.id];
     $scope.payFee = function()
     {
         $location.path('/');
     }
}

function AddStudentCtrl ($scope,$location,FeeService ) {

     $scope.student={name:"", standard:"",school:""}
     $scope.student.school="0";
     $scope.student.standard="0";

     $scope.save = function()
     {
         $scope.students.push($scope.student);
         $location.path('/');
     }
    $scope.items = {
        "name": "Alabama",
        "abbreviation": "AL"
    };
    $scope.name = ''; // This will hold the selected item
    $scope.onItemSelected = function() { // this gets executed when an item is selected
        console.log('selected=' + $scope.name);
    };

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

//        for (var count=0;count<iterData.length;count++)
//        {
//
//       //     jsonData = {iterDat[0].split(",")};
//            var str = "\""+iterData[count] +"\"";
//            var schoolId=(str.split(',')[0]);
//            var schoolName= (str.split(',')[1]);
//
//            var jsonData = "{schoolId:"+schoolId +"\","+"schoolName:\""+ schoolName+"}";
//            alert(jsonData);
//    dataArray.push(jsonData);
//        }
        alert(($scope.sheets['Sheet1']).data[0]);
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

function EditStudentCtrl($scope,$location,$routeParams ) {
    $scope.student=$scope.students[$routeParams.id];

    $scope.save = function()
    {
          $location.path('/');
    }

}

function schoolCtrl($scope,$rootScope,FeeService,SchoolService){
    $scope.students= [
        {name:"Muruga",standard:"1"},
        {name:"Aarupadaiyappa",standard:"2"}
    ]

    $scope.myForm = {};

// Model for your selected item
    $scope.selection;

// List of choices
    $scope.states = ['Alabama','California','Deleware'];

    FeeService.get();
    var schoolList = SchoolService.query();

    $scope.myForm.schools = schoolList;
        //[    {id:"0",name:"select"}].push(schoolList);
//  /*      [
//        {id:"0",name:"select"},
//        {id:"1",name:"Aringnar Anna middle school,Tondiarpet"},
//        {id:"2",name:"Kalaimagal vidyalaya, Royapuram"}
//    ]*/

    $scope.myForm.standards= [
        {id:"0",name:"select"},{id:"1",name:"I"},{id:"2",name:"II"},{id:"3",name:"III"}
    ]

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
        $http.jsonp('response.json', config)
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


function TypeaheadCtrl($scope, $http) {

    $scope.selected = undefined;
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

    $scope.statesWithFlags = [{"name":"Alabama","flag":"5/5c/Flag_of_Alabama.svg/45px-Flag_of_Alabama.svg.png"},{"name":"Alaska","flag":"e/e6/Flag_of_Alaska.svg/43px-Flag_of_Alaska.svg.png"},{"name":"Arizona","flag":"9/9d/Flag_of_Arizona.svg/45px-Flag_of_Arizona.svg.png"},{"name":"Arkansas","flag":"9/9d/Flag_of_Arkansas.svg/45px-Flag_of_Arkansas.svg.png"},{"name":"California","flag":"0/01/Flag_of_California.svg/45px-Flag_of_California.svg.png"},{"name":"Colorado","flag":"4/46/Flag_of_Colorado.svg/45px-Flag_of_Colorado.svg.png"},{"name":"Connecticut","flag":"9/96/Flag_of_Connecticut.svg/39px-Flag_of_Connecticut.svg.png"},{"name":"Delaware","flag":"c/c6/Flag_of_Delaware.svg/45px-Flag_of_Delaware.svg.png"},{"name":"Florida","flag":"f/f7/Flag_of_Florida.svg/45px-Flag_of_Florida.svg.png"},{"name":"Georgia","flag":"5/54/Flag_of_Georgia_%28U.S._state%29.svg/46px-Flag_of_Georgia_%28U.S._state%29.svg.png"},{"name":"Hawaii","flag":"e/ef/Flag_of_Hawaii.svg/46px-Flag_of_Hawaii.svg.png"},{"name":"Idaho","flag":"a/a4/Flag_of_Idaho.svg/38px-Flag_of_Idaho.svg.png"},{"name":"Illinois","flag":"0/01/Flag_of_Illinois.svg/46px-Flag_of_Illinois.svg.png"},{"name":"Indiana","flag":"a/ac/Flag_of_Indiana.svg/45px-Flag_of_Indiana.svg.png"},{"name":"Iowa","flag":"a/aa/Flag_of_Iowa.svg/44px-Flag_of_Iowa.svg.png"},{"name":"Kansas","flag":"d/da/Flag_of_Kansas.svg/46px-Flag_of_Kansas.svg.png"},{"name":"Kentucky","flag":"8/8d/Flag_of_Kentucky.svg/46px-Flag_of_Kentucky.svg.png"},{"name":"Louisiana","flag":"e/e0/Flag_of_Louisiana.svg/46px-Flag_of_Louisiana.svg.png"},{"name":"Maine","flag":"3/35/Flag_of_Maine.svg/45px-Flag_of_Maine.svg.png"},{"name":"Maryland","flag":"a/a0/Flag_of_Maryland.svg/45px-Flag_of_Maryland.svg.png"},{"name":"Massachusetts","flag":"f/f2/Flag_of_Massachusetts.svg/46px-Flag_of_Massachusetts.svg.png"},{"name":"Michigan","flag":"b/b5/Flag_of_Michigan.svg/45px-Flag_of_Michigan.svg.png"},{"name":"Minnesota","flag":"b/b9/Flag_of_Minnesota.svg/46px-Flag_of_Minnesota.svg.png"},{"name":"Mississippi","flag":"4/42/Flag_of_Mississippi.svg/45px-Flag_of_Mississippi.svg.png"},{"name":"Missouri","flag":"5/5a/Flag_of_Missouri.svg/46px-Flag_of_Missouri.svg.png"},{"name":"Montana","flag":"c/cb/Flag_of_Montana.svg/45px-Flag_of_Montana.svg.png"},{"name":"Nebraska","flag":"4/4d/Flag_of_Nebraska.svg/46px-Flag_of_Nebraska.svg.png"},{"name":"Nevada","flag":"f/f1/Flag_of_Nevada.svg/45px-Flag_of_Nevada.svg.png"},{"name":"New Hampshire","flag":"2/28/Flag_of_New_Hampshire.svg/45px-Flag_of_New_Hampshire.svg.png"},{"name":"New Jersey","flag":"9/92/Flag_of_New_Jersey.svg/45px-Flag_of_New_Jersey.svg.png"},{"name":"New Mexico","flag":"c/c3/Flag_of_New_Mexico.svg/45px-Flag_of_New_Mexico.svg.png"},{"name":"New York","flag":"1/1a/Flag_of_New_York.svg/46px-Flag_of_New_York.svg.png"},{"name":"North Carolina","flag":"b/bb/Flag_of_North_Carolina.svg/45px-Flag_of_North_Carolina.svg.png"},{"name":"North Dakota","flag":"e/ee/Flag_of_North_Dakota.svg/38px-Flag_of_North_Dakota.svg.png"},{"name":"Ohio","flag":"4/4c/Flag_of_Ohio.svg/46px-Flag_of_Ohio.svg.png"},{"name":"Oklahoma","flag":"6/6e/Flag_of_Oklahoma.svg/45px-Flag_of_Oklahoma.svg.png"},{"name":"Oregon","flag":"b/b9/Flag_of_Oregon.svg/46px-Flag_of_Oregon.svg.png"},{"name":"Pennsylvania","flag":"f/f7/Flag_of_Pennsylvania.svg/45px-Flag_of_Pennsylvania.svg.png"},{"name":"Rhode Island","flag":"f/f3/Flag_of_Rhode_Island.svg/32px-Flag_of_Rhode_Island.svg.png"},{"name":"South Carolina","flag":"6/69/Flag_of_South_Carolina.svg/45px-Flag_of_South_Carolina.svg.png"},{"name":"South Dakota","flag":"1/1a/Flag_of_South_Dakota.svg/46px-Flag_of_South_Dakota.svg.png"},{"name":"Tennessee","flag":"9/9e/Flag_of_Tennessee.svg/46px-Flag_of_Tennessee.svg.png"},{"name":"Texas","flag":"f/f7/Flag_of_Texas.svg/45px-Flag_of_Texas.svg.png"},{"name":"Utah","flag":"f/f6/Flag_of_Utah.svg/45px-Flag_of_Utah.svg.png"},{"name":"Vermont","flag":"4/49/Flag_of_Vermont.svg/46px-Flag_of_Vermont.svg.png"},{"name":"Virginia","flag":"4/47/Flag_of_Virginia.svg/44px-Flag_of_Virginia.svg.png"},{"name":"Washington","flag":"5/54/Flag_of_Washington.svg/46px-Flag_of_Washington.svg.png"},{"name":"West Virginia","flag":"2/22/Flag_of_West_Virginia.svg/46px-Flag_of_West_Virginia.svg.png"},{"name":"Wisconsin","flag":"2/22/Flag_of_Wisconsin.svg/45px-Flag_of_Wisconsin.svg.png"},{"name":"Wyoming","flag":"b/bc/Flag_of_Wyoming.svg/43px-Flag_of_Wyoming.svg.png"}];
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




