/**
 * Created by laxmanra on 7/4/2014.
 */

var app = angular.module('school',['ngRoute','UserApp','ngResource']).
    config(function ($routeProvider,$locationProvider){
$locationProvider.html5Mode(true);
    $routeProvider.when('/',{
        templateUrl: '/payfee/partials/studentsList.html'
    }).when('/addStudent',{
        templateUrl: '/payfee/partials/AddStudent.html', controller: 'AddStudentCtrl'
    }).when('/editStudent/:id',{
        templateUrl: '/payfee/partials/AddStudent.html', controller: 'EditStudentCtrl'
    }).when('/payfee/:id',{
        templateUrl: '/payfee/partials/PayFee.html', controller: 'PayFeeCtrl'
        }).when('/adminupload',{
        templateUrl: '/payfee/partials/UploadStudents.html', controller: 'uploadCtrl'
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




