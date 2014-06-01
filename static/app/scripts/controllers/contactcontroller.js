app.controller('ContactListCtrl', ['$scope','$filter','Auth','Account','Contact','Tag','Edge',
    function($scope,$filter,Auth,Account,Contact,Tag,Edge) {
        $("ul.page-sidebar-menu li").removeClass("active");
        $("#id_Contacts").addClass("active");

        document.title = "Contacts: Home";
        $scope.isSignedIn = false;
        $scope.immediateFailed = false;
        $scope.nextPageToken = undefined;
        $scope.prevPageToken = undefined;
        $scope.isLoading = false;
        $scope.contactpagination = {};
        $scope.currentPage = 01;
        //HKA 10.12.2013 Var Contact to manage Next & Prev
        $scope.contactpagination={};
        $scope.contactCurrentPage=01;
        $scope.contactpages = [];
        $scope.pages = [];
      	$scope.contacts = [];
        $scope.contact = {};
        $scope.contact.access = 'public';
        $scope.order = '-updated_at';
        $scope.selected_tags = [];
        $scope.draggedTag=null;
        $scope.tag = {};
        $scope.showNewTag=false;
        $scope.color_pallet=[
         {'name':'red','color':'#F7846A'},
         {'name':'orange','color':'#FFBB22'},
         {'name':'yellow','color':'#EEEE22'},
         {'name':'green','color':'#BBE535'},
         {'name':'blue','color':'#66CCDD'},
         {'name':'gray','color':'#B5C5C5'},
         {'name':'teal','color':'#77DDBB'},
         {'name':'purple','color':'#E874D6'},
         ];
         $scope.tag.color= {'name':'green','color':'#BBE535'};

        // What to do after authentication
       $scope.runTheProcess = function(){
            var params = {'order' : $scope.order,'limit':20}
            Contact.list($scope,params);
            var paramsTag = {'about_kind':'Contact'};
            Tag.list($scope,paramsTag);
            // for (var i=0;i<100;i++)
            // {
            //     var params = {
            //               'firstname': 'Dja3fer',
            //               'lastname':'M3amer ' + i.toString(),
            //               'access':'public',
            //               'account': 'ahNkZXZ-Z2NkYzIwMTMtaW9ncm93chQLEgdBY2NvdW50GICAgICAgIgKDA'
            //             }
            //     Contact.insert($scope,params);
            // }

       };
       $scope.getPosition= function(index){
        if(index<4){

          return index+1;
        }else{
          console.log((index%4)+1);
          return (index%4)+1;
        }
     };
        // We need to call this to refresh token when user credentials are invalid
       $scope.refreshToken = function() {
            Auth.refreshToken();
       };

       $scope.listMoreItems = function(){
        var nextPage = $scope.contactCurrentPage + 1;
        var params = {};
        if ($scope.contactpages[nextPage]){
            params = {
                      'limit':20,
                      'order' : $scope.order,
                      'pageToken':$scope.contactpages[nextPage]
                    }
            $scope.contactCurrentPage = $scope.contactCurrentPage + 1 ;
            Contact.listMore($scope,params);
        }
      };
       $scope.listNextPageItems = function(){

          var nextPage = $scope.contactCurrentPage + 1;
          var params = {};
            if ($scope.contactpages[nextPage]){
              params = {'order' : $scope.order,'limit':8,
                        'pageToken':$scope.contactpages[nextPage]
                       }
            }else{
              params = {'order' : $scope.order,'limit':8}
            }

            $scope.contactCurrentPage = $scope.contactCurrentPage + 1 ;
            Contact.list($scope,params);
       };
       $scope.listPrevPageItems = function(){

         var prevPage = $scope.contactCurrentPage - 1;
         var params = {};
            if ($scope.contactpages[prevPage]){
              params = {'limit':8,
                        'pageToken':$scope.contactpages[prevPage]
                       }
            }else{
              params = {'order' : $scope.order,'limit':8}
            }
            $scope.contactCurrentPage = $scope.contactCurrentPage - 1 ;
            Contact.list($scope,params);
       };
        $scope.showImportModal = function(){
          $('#importModal').modal('show');
        }
        $scope.createPickerUploader = function() {
          $('#importModal').modal('hide');
          var developerKey = 'AIzaSyCqpqK8oOc4PUe77_nNYNvzh9xhTWd_gJk';
          var projectfolder = $scope.contact.folder;
          var docsView = new google.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true);
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView().setParent(projectfolder)).
              addView(docsView).
              setCallback($scope.uploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId(987765099891).
                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
              build();
          picker.setVisible(true);
      };
      $scope.uploaderCallback = function(data) {


        if (data.action == google.picker.Action.PICKED) {
                if(data.docs){
                    var params = {
                                  'file_id': data.docs[0].id
                                  };
                    Contact.import($scope,params);
                }
        }
      }
      // new Contact
      $scope.showModal = function(){
        $('#addContactModal').modal('show');

      };
      $scope.save = function(contact){
          var params = {};
          var contact_name = new Array();


          contact.display_name = contact_name;
          if (typeof(contact.account)=='object'){
            contact.account_name = contact.account.name;
            contact.account = contact.account.entityKey;

            Contact.insert($scope,contact);

          }else if($scope.searchAccountQuery.length>0){
              // create a new account with this account name
              var params = {'name': $scope.searchAccountQuery,
                            'access': contact.access
              };
              $scope.contact = contact;
              Account.insert($scope,params);
          };
          $('#addContactModal').modal('hide');
      };
      $scope.addContactOnKey = function(contact){
          if(event.keyCode == 13 && contact){
              $scope.save(contact);
          }
      };


     var params_search_account ={};
     $scope.result = undefined;
     $scope.q = undefined;
     $scope.$watch('searchAccountQuery', function() {
         params_search_account['q'] = $scope.searchAccountQuery;
         Account.search($scope,params_search_account);

      });
      $scope.selectAccount = function(){
        $scope.contact.account = $scope.searchAccountQuery;

     };


     // Quick Filtering
     var searchParams ={};
     $scope.result = undefined;
     $scope.q = undefined;

     $scope.$watch('searchQuery', function() {
         searchParams['q'] = $scope.searchQuery;
         Contact.search($scope,searchParams);
     });
     $scope.selectResult = function(){
          window.location.replace('#/contacts/show/'+$scope.searchQuery.id);
     };
     $scope.executeSearch = function(searchQuery){
        if (typeof(searchQuery)=='string'){
           var goToSearch = 'type:Contact ' + searchQuery;
           window.location.replace('#/search/'+goToSearch);
        }else{
          window.location.replace('#/contacts/show/'+searchQuery.id);
        }
        $scope.searchQuery=' ';
        $scope.$apply();
     };
     // Sorting
     $scope.orderBy = function(order){
        var params = { 'order': order,
                        'limit':8};
        $scope.order = order;
        Contact.list($scope,params);
     };
     $scope.filterByOwner = function(filter){
        if (filter){
          var params = { 'owner': filter,
                         'order': $scope.order,
                         'limit':8}
        }
        else{
          var params = {
              'order': $scope.order,

              'limit':8}
        };
        $scope.isFiltering = true;
        Contact.list($scope,params);
     };

/***********************************************
      HKA 19.02.2014  tags
***************************************************************************************/
$scope.listTags=function(){
      var paramsTag = {'about_kind':'Contact'}
      Tag.list($scope,paramsTag);
     };
$scope.edgeInserted = function () {
       $scope.listcontacts();
     };
$scope.listcontacts = function(){
  var params = { 'order': $scope.order,
                        'limit':6}
          Contact.list($scope,params);
};


$scope.addNewtag = function(tag){
       var params = {
                          'name': tag.name,
                          'about_kind':'Contact',
                          'color':tag.color.color
                      }  ;
       Tag.insert($scope,params);
        $scope.tag.name='';
        $scope.tag.color= {'name':'green','color':'#BBE535'};
        var paramsTag = {'about_kind':'Contact'};
        Tag.list($scope,paramsTag);

     }
$scope.updateTag = function(tag){
            params ={ 'id':tag.id,
                      'title': tag.name,
                      'status':tag.color
            };
      Tag.patch($scope,params);
  };
  $scope.deleteTag=function(tag){
          params = {
            'entityKey': tag.entityKey
          }
          Tag.delete($scope,params);

      };



$scope.selectTag= function(tag,index,$event){
      if(!$scope.manage_tags){
         var element=$($event.target);
         if(element.prop("tagName")!='LI'){
              element=element.parent();
              element=element.parent();
         }
         var text=element.find(".with-color");
         if($scope.selected_tags.indexOf(tag) == -1){
            $scope.selected_tags.push(tag);
            element.css('background-color', tag.color+'!important');
            text.css('color',$scope.idealTextColor(tag.color));

         }else{
            element.css('background-color','#ffffff !important');
            $scope.selected_tags.splice($scope.selected_tags.indexOf(tag),1);
             text.css('color','#000000');
         }
         ;
         $scope.filterByTags($scope.selected_tags);

      }

    };
  $scope.filterByTags = function(selected_tags){
         var tags = [];
         angular.forEach(selected_tags, function(tag){
            tags.push(tag.entityKey);
         });
         var params = {
          'tags': tags,
          'order': $scope.order,
                        'limit':20
         };
         $scope.isFiltering = true;
         Contact.list($scope,params);

  };

$scope.unselectAllTags= function(){
        $('.tags-list li').each(function(){
            var element=$(this);
            var text=element.find(".with-color");
             element.css('background-color','#ffffff !important');
             text.css('color','#000000');
        });
     };
//HKA 19.02.2014 When delete tag render account list
 $scope.tagDeleted = function(){
    $scope.listcontacts();

 };


$scope.manage=function(){
        $scope.unselectAllTags();
      };
$scope.tag_save = function(tag){
          if (tag.name) {
             Tag.insert($scope,tag);

           };
      };

$scope.editTag=function(tag){
        $scope.edited_tag=tag;
     }
$scope.doneEditTag=function(tag){
        $scope.edited_tag=null;
        $scope.updateTag(tag);
     }
$scope.addTags=function(){
      var tags=[];
      var items = [];
      tags=$('#select2_sample2').select2("val");

      angular.forEach($scope.selected_tasks, function(selected_task){
          angular.forEach(tags, function(tag){
            var edge = {
              'start_node': selected_task.entityKey,
              'end_node': tag,
              'kind':'tags',
              'inverse_edge': 'tagged_on'
            };
            items.push(edge);
          });
      });

      params = {
        'items': items
      }

      Edge.insert($scope,params);
      $('#assigneeTagsToTask').modal('hide');

     };

     var handleColorPicker = function () {
          if (!jQuery().colorpicker) {
              return;

          }
          $('.colorpicker-default').colorpicker({
              format: 'hex'
          });
      }
      handleColorPicker();

      $('#addMemberToTask > *').on('click', null, function(e) {
            e.stopPropagation();
        });
      $scope.idealTextColor=function(bgColor){
        var nThreshold = 105;
         var components = getRGBComponents(bgColor);
         var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

         return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
      }
      function getRGBComponents(color) {

          var r = color.substring(1, 3);
          var g = color.substring(3, 5);
          var b = color.substring(5, 7);

          return {
             R: parseInt(r, 16),
             G: parseInt(g, 16),
             B: parseInt(b, 16)
          };
      }
      $scope.dragTag=function(tag){
        $scope.draggedTag=tag;
         //$scope.$apply();
      };
      $scope.dropTag=function(contact,index){
        var items = [];

        var params = {
              'parent': contact.entityKey,
              'tag_key': $scope.draggedTag.entityKey
        };
        $scope.draggedTag=null;
        Tag.attach($scope,params,index);

      };
      $scope.tagattached=function(tag,index){
          if ($scope.contacts[index].tags == undefined){
            $scope.contacts[index].tags = [];
          }
           var ind = $filter('exists')(tag, $scope.contacts[index].tags);
           if (ind == -1) {
                $scope.contacts[index].tags.push(tag);
                var card_index = '#card_'+index;
                $(card_index).removeClass('over');
            }else{
                 var card_index = '#card_'+index;
                $(card_index).removeClass('over');
            }

              $scope.$apply();
      };

  // HKA 12.03.2014 Pallet color on Tags
      $scope.checkColor=function(color){
        $scope.tag.color=color;
      }

     // Google+ Authentication
     Auth.init($scope);
     $(window).scroll(function() {
          if (!$scope.isLoading && ($(window).scrollTop() >  $(document).height() - $(window).height() - 100)) {
              $scope.listMoreItems();
          }
      });
}]);


app.controller('ContactShowCtrl', ['$scope','$filter','$route','Auth','Email', 'Task','Event','Note','Topic','Contact','Opportunity','Case','Permission','User','Attachement','Map','Opportunitystage','Casestatus','InfoNode',
    function($scope,$filter,$route,Auth,Email,Task,Event,Note,Topic,Contact,Opportunity,Case,Permission,User,Attachement,Map,Opportunitystage,Casestatus,InfoNode) {
 console.log('I am in ContactShowCtrl');
      $("ul.page-sidebar-menu li").removeClass("active");
      $("#id_Contacts").addClass("active");

     $scope.selectedTab = 2;
     $scope.isSignedIn = false;
     $scope.immediateFailed = false;
     $scope.isContentLoaded = false;
     $scope.pagination = {};
     $scope.nextPageToken = undefined;
     $scope.prevPageToken = undefined;
     $scope.currentPage = 01;
     $scope.pages = [];
     //HKA 10.12.2013 Var topic to manage Next & Prev
     $scope.topicCurrentPage=01;
     $scope.topicpagination={};
     $scope.topicpages = [];
    //HKA 11.12.2013 var Opportunity to manage Next & Prev
     $scope.opppagination = {};
     $scope.oppCurrentPage=01;
     $scope.opppages=[];
     //HKA 11.12.2013 var Case to manage Next & Prev
     $scope.casepagination = {};
     $scope.caseCurrentPage=01;
     $scope.casepages=[];
     $scope.documentpagination = {};
     $scope.documentCurrentPage=01;
     $scope.documentpages=[];
     $scope.showPhoneForm=false;

      $scope.accounts = [];
      $scope.opportunities = [];
      $scope.Opportunities = {};
      $scope.email = {};
      $scope.stage_selected={};
      $scope.status_selected={};
      $scope.infonodes = {};
      $scope.phone={};
      $scope.phone.type= 'work';
      $scope.casee = {};
      $scope.casee.priority = 4;
      $scope.sharing_with = [];
      $scope.statuses = [
      {value: 'Home', text: 'Home'},
      {value: 'Work', text: 'Work'},
      {value: 'Mob', text: 'Mob'},
      {value: 'Other', text: 'Other'}
      ];
      $scope.showUpload=false;
      $scope.profile_img = {
                            'profile_img_id':null,
                            'profile_img_url':null
                          };


      $scope.waterfallTrigger= function(){


            /* $('.waterfall').hide();
           $('.waterfall').show();*/
           $( window ).trigger( "resize" );
           if($(".chart").parent().width()==0){
            var leftMargin=210-$(".chart").width();
                   $(".chart").css( "left",leftMargin/2);
                   $(".oppStage").css( "left",leftMargin/2-2);
           }else{
               var leftMargin=$(".chart").parent().width()-$(".chart").width();
                   $(".chart").css( "left",leftMargin/2);
                   $(".oppStage").css( "left",leftMargin/2-2);

           }
      };
      // What to do after authentication
      $scope.runTheProcess = function(){

          var params = {
                          'id':$route.current.params.contactId,

                          'topics':{
                            'limit': '7'
                          },

                          'opportunities':{
                            'limit': '15'
                          },

                          'cases':{
                            'limit': '15'
                          },

                          'documents':{
                            'limit': '15'
                          },

                          'tasks':{

                          },

                          'events':{

                          }
                      };
          Contact.get($scope,params);
          User.list($scope,{});
          Opportunitystage.list($scope,{});
          Casestatus.list($scope,{});

      };
        // We need to call this to refresh token when user credentials are invalid
      $scope.refreshToken = function() {
            Auth.refreshToken();
      };
      $scope.getTopicUrl = function(type,id){
      return Topic.getUrl(type,id);
    };
     //HKA 11.11.2013
    $scope.TopiclistNextPageItems = function(){


        var nextPage = $scope.topicCurrentPage + 1;
        var params = {};
          if ($scope.topicpages[nextPage]){
            params = {
                      'id':$scope.contact.id,
                        'topics':{
                          'limit': '7',
                          'pageToken':$scope.topicpages[nextPage]
                        }
                     }
              $scope.topicCurrentPage = $scope.topicCurrentPage + 1 ;
              Contact.get($scope,params);
            }


     }


     $scope.listTopics = function(contact){
        var params = {
                      'id':$scope.contact.id,
                      'topics':{
                             'limit': '7'
                       }
                    };
          Contact.get($scope,params);

     };
     //HKA 10.12.2013 Page Prev & Next on List Opportunities
  $scope.OpplistNextPageItems = function(){


        var nextPage = $scope.oppCurrentPage + 1;
        var params = {};
          if ($scope.opppages[nextPage]){
            params = {
                      'id':$scope.contact.id,
                        'opportunities':{
                          'limit': '6',
                          'pageToken':$scope.opppages[nextPage]
                        }
                     }
            $scope.oppCurrentPage = $scope.oppCurrentPage + 1 ;
            Contact.get($scope,params);
            }

     };

    //HKA 07.12.2013 Manage Prev & Next Page on Related List Cases
$scope.CaselistNextPageItems = function(){


        var nextPage = $scope.caseCurrentPage + 1;
        var params = {};
          if ($scope.casepages[nextPage]){
            params = {
                      'id':$scope.contact.id,
                        'cases':{
                          'limit': '15',
                          'pageToken':$scope.casepages[nextPage]
                        }
                     }
            $scope.caseCurrentPage = $scope.caseCurrentPage + 1 ;
            Contact.get($scope,params);
          }

     }



     $scope.hilightTopic = function(){
        console.log('Should higll');
       $('#topic_0').effect( "bounce", "slow" );
       $('#topic_0 .message').effect("highlight","slow");
     }





     $scope.selectMember = function(){
        $scope.slected_memeber = $scope.user;
        $scope.user = '';
        $scope.sharing_with.push($scope.slected_memeber);

     };
     $scope.updateCollaborators = function(){
          var contactid = {'id':$route.current.params.contactId};
          Contact.get($scope,contactid);

     };
      $scope.share = function(slected_memeber){
        console.log('permissions.insert share');
        console.log(slected_memeber);
        $scope.$watch($scope.contact.access, function() {
         var body = {'access':$scope.contact.access};
         var id = $scope.contact.id;
         var params ={'id':id,
                      'access':$scope.contact.access}
         Contact.patch($scope,params);
        });
        $('#sharingSettingsModal').modal('hide');

        if ($scope.sharing_with.length>0){

          var items = [];

          angular.forEach($scope.sharing_with, function(user){
                      var item = {
                                  'type':"user",
                                  'value':user.entityKey
                                };
                      items.push(item);
          });

          if(items.length>0){
              var params = {
                            'about': $scope.contact.entityKey,
                            'items': items
              }
              Permission.insert($scope,params);
          }


          $scope.sharing_with = [];


        }


     };

  $scope.editacontact = function(){
    $('#EditContactModal').modal('show');
  }
  //HKA 27.11.2013 Update Contact updatecontact
  $scope.updatecontact = function(contact){
    var params={'id':$scope.contact.id,
                'firstname':contact.firstname,
                'lastname':contact.lastname,
                'title':contact.title};
        Contact.patch($scope,params);
        $('#EditContactModal').modal('hide')

  };
  //HKA 01.12.2013 Edit tagline of Account
    $scope.edittagline = function() {
       $('#EditTagModal').modal('show');
    };
    //HKA 01.12.2013 Edit Introduction on Account
    $scope.editintro = function() {
       $('#EditIntroModal').modal('show');
    };
// HKA 19.03.2014 inline update infonode
     $scope.inlinePatch=function(kind,edge,name,entityKey,value){

   if (kind=='Contact') {

      if (name=='firstname')
        {params = {'id':$scope.contact.id,
             firstname:value};
         Contact.patch($scope,params);};
       if (name=='lastname')
        {params = {'id':$scope.contact.id,
             lastname:value};
         Contact.patch($scope,params);}
   }else{



          params = {
                  'entityKey': entityKey,
                  'parent':$scope.contact.entityKey,
                  'kind':edge,
                  'fields':[

                      {
                        "field": name,
                        "value": value
                      }
                  ]
        };

         InfoNode.patch($scope,params);
   }


  };
 //HKA 09.11.2013 Add a new Task
   $scope.addTask = function(task){

        $('#myModal').modal('hide');
        if (task.due){

            var dueDate= $filter('date')(task.due,['yyyy-MM-ddT00:00:00.000000']);

            params ={'title': task.title,
                      'due': dueDate,
                      'parent': $scope.contact.entityKey
            }


        }else{
            params ={'title': task.title,
                     'parent': $scope.contact.entityKey
                   }
        };
        $scope.task.title='';
        $scope.task.dueDate='0000-00-00T00:00:00-00:00';
        Task.insert($scope,params);
     }

     $scope.hilightTask = function(){
        console.log('Should higll');
        $('#task_0').effect("highlight","slow");
        $('#task_0').effect( "bounce", "slow" );

     }
     $scope.listTasks = function(){
        var params = {
                        'id':$scope.contact.id,
                        'tasks':{}
                      };
        Contact.get($scope,params);

     }
 //HKA 10.11.2013 Add event
 $scope.addEvent = function(ioevent){

        $('#newEventModal').modal('hide');
        var params ={}

        if (ioevent.starts_at){
            if (ioevent.ends_at){
              params ={'title': ioevent.title,
                      'starts_at': $filter('date')(ioevent.starts_at,['yyyy-MM-ddTHH:mm:00.000000']),
                      'ends_at': $filter('date')(ioevent.ends_at,['yyyy-MM-ddTHH:mm:00.000000']),
                      'where': ioevent.where,
                      'parent':$scope.contact.entityKey
              }

            }else{
              params ={
                'title': ioevent.title,
                      'starts_at': $filter('date')(ioevent.starts_at,['yyyy-MM-ddTHH:mm:00.000000']),
                      'where': ioevent.where,
                      'parent':$scope.contact.entityKey
              }
            }

            Event.insert($scope,params);
            $scope.ioevent.title='';
            $scope.ioevent.where='';
            $scope.ioevent.starts_at='T00:00:00.000000';
          };
     }
     $scope.hilightEvent = function(){
        console.log('Should higll');
        $('#event_0').effect("highlight","slow");
        $('#event_0').effect( "bounce", "slow" );

     }
     $scope.listEvents = function(){
        var params = {
                        'id':$scope.contact.id,
                        'events':{

                        }
                      };
        Contact.get($scope,params);

     };
  //HKA 02.12.2013 List Opportunities related to Contact
     $scope.listOpportunities = function(){
        var params = {'contact':$scope.contact.entityKey,
                      //'order': '-updated_at',
                      'limit': 6
                      };
        Opportunity.list($scope,params);

     };

  //HKA 02.12.2013 List Cases related to Contact
  $scope.listCases = function(){
    var params ={'contact':$scope.contact.entityKey,
                  //'order':'-creationTime',
                  'limit':6};

    Case.list($scope,params)
  };
     //HKA 11.11.2013 Add Note
  $scope.addNote = function(note){
    var params ={
                  'about': $scope.contact.entityKey,
                  'title': note.title,
                  'content': note.content
      };
    Note.insert($scope,params);
    $scope.note.title='';
    $scope.note.content='';

};
//HKA 26.11.2013 Update Case
$scope.updatContactHeader = function(contact){

  params = {'id':$scope.contact.id,
             'name':contact.name,
             'priority' :casee.priority,
           'status':casee.status,
           'type_case':casee.type_case};
  Case.patch($scope,params);
 $('#EditCaseModal').modal('hide');
  };


  // HKA 01.12.2013 Show modal Related list (Opportunity)
  $scope.addOppModal = function(){
    $('#addOpportunityModal').modal('show');
  };

  //HKA 01.12.2013 Show modal Related list (Case)
  $scope.addCaseModal = function(){
    $('#addCaseModal').modal('show');
  };
  // HKA 02.12.2013 Add Opportunty related to Contact
    $scope.saveOpp = function(opportunity){

      var params = {'name':opportunity.name,
                      'amount': opportunity.amount,
                      'account':$scope.contact.account.entityKey,
                      'contact':$scope.contact.entityKey,
                      'stage' :$scope.stage_selected.entityKey,
                      'access': $scope.contact.access
                      };
      Opportunity.insert($scope,params);
      $('#addOpportunityModal').modal('hide');
    };


  // HKA 01.12.2013 Add Case related to Contact
    $scope.saveCase = function(casee){


        var params = {'name':casee.name,
                      'priority':casee.priority,
                      'status_name': $scope.status_selected.entityKey,
                      'account':$scope.contact.account.entityKey,
                      'contact':$scope.contact.entityKey,
                      'access': $scope.contact.access
                      };
      Case.insert($scope,params);
      $('#addCaseModal').modal('hide');
    };

  //HKA 01.12.2013 Add Phone
 $scope.addPhone = function(phone){

  params = {'parent':$scope.contact.entityKey,
            'kind':'phones',
            'fields':[
                {
                  "field": "type",
                  "value": phone.type
                },
                {
                  "field": "number",
                  "value": phone.number
                }
            ]
  };
  InfoNode.insert($scope,params);
    $scope.phone={};
    $scope.phone.type= 'work';
    $scope.showPhoneForm=false;
  };
$scope.listInfonodes = function(kind) {

     params = {'parent':$scope.contact.entityKey,
               'connections': kind
              };
     InfoNode.list($scope,params);
 }

//HKA 20.11.2013 Add Email
$scope.addEmail = function(email){


   params = {'parent':$scope.contact.entityKey,
            'kind':'emails',
            'fields':[
                {
                  "field": "email",
                  "value": email.email
                }
            ]
  };
  InfoNode.insert($scope,params);
  $scope.email={};
  $scope.showEmailForm = false;
  };



//HKA 22.11.2013 Add Website
$scope.addWebsite = function(website){
  params = {'parent':$scope.contact.entityKey,
            'kind':'websites',
            'fields':[
                {
                  "field": "url",
                  "value": website.url
                }
            ]
  };
  InfoNode.insert($scope,params);
  $scope.website={};
  $scope.showWebsiteForm=false;
};

//HKA 22.11.2013 Add Social
$scope.addSocial = function(social){
  params = {'parent':$scope.contact.entityKey,
            'kind':'sociallinks',
            'fields':[
                {
                  "field": "url",
                  "value": social.url
                }
            ]
  };
  InfoNode.insert($scope,params);
  $scope.sociallink={};
  $scope.showSociallinkForm=false;

};
$scope.addCustomField = function(customField){
  params = {'parent':$scope.contact.entityKey,
            'kind':'customfields',
            'fields':[
                {
                  "field": customField.field,
                  "value": customField.value
                }
            ]
  };
  InfoNode.insert($scope,params);

    $scope.customfield={};
    $scope.showCustomFieldForm = false;

};

//HKA 01.12.2013 Add Tagline
$scope.updateTagline = function(contact){

  params = {'id':$scope.contact.id,
             'tagline':contact.tagline}
  Contact.patch($scope,params);
  $('#EditTagModal').modal('hide');
};

//HKA 01.12.2013 Add Introduction
$scope.updateintro = function(contact){

  params = {'id':$scope.contact.id,
             'introduction':contact.introduction}
  Contact.patch($scope,params);
  $('#EditIntroModal').modal('hide');
};

     $('#some-textarea').wysihtml5();

      $scope.sendEmail = function(email){
        email.body = $('#some-textarea').val();
        console.log(email);
        /*
        to = messages.StringField(2)
        cc = messages.StringField(3)
        bcc = messages.StringField(4)
        subject = messages.StringField(5)
        body = messages.StringField(6)
        about_kind = messages.StringField(7)
        about_item = messages.StringField(8)
        */
        var params = {
                  'to': email.to,
                  'cc': email.cc,
                  'bcc': email.bcc,
                  'subject': email.subject,
                  'body': email.body,
                  'about_item':$scope.contact.id,
                  'about_kind':'Contact' };

        Email.send($scope,params);
      };
      $scope.editbeforedelete = function(){
     $('#BeforedeleteContact').modal('show');
   };
   $scope.deletecontact = function(){

     var params = {'entityKey':$scope.contact.entityKey};
     console.log(params);
     Contact.delete($scope, params);
     $('#BeforedeleteContact').modal('hide');

     };
     $scope.contactDeleted = function(resp){

        window.location.replace('/#/contacts');

     };

     $scope.DocumentlistNextPageItems = function(){


        var nextPage = $scope.documentCurrentPage + 1;
        var params = {};
          if ($scope.documentpages[nextPage]){
            params = {
                        'id':$scope.contact.id,
                        'documents':{
                          'limit': '15',
                          'pageToken':$scope.documentpages[nextPage]
                        }
                      }
            $scope.documentCurrentPage = $scope.documentCurrentPage + 1 ;

            Contact.get($scope,params);

          }


     }
     $scope.DocumentPrevPageItems = function(){

       var prevPage = $scope.documentCurrentPage - 1;
       var params = {};
          if ($scope.documentpages[prevPage]){
            params = {
                        'id':$scope.contact.id,
                        'documents':{
                          'limit': '6',
                          'pageToken':$scope.documentpages[prevPage]
                        }
                      }

          }else{
            params = {
                        'id':$scope.contact.id,
                        'documents':{
                          'limit': '6'
                        }
                      }
          }
          $scope.documentCurrentPage = $scope.documentCurrentPage - 1 ;
          Contact.get($scope,params);


     };
     $scope.listDocuments = function(){
        var params = {
                        'id':$scope.contact.id,
                        'documents':{
                          'limit': '6'
                        }
                      }
        Contact.get($scope,params);

     };
     $scope.showCreateDocument = function(type){

        $scope.mimeType = type;
        $('#newDocument').modal('show');
     };
     $scope.createDocument = function(newdocument){
        var mimeType = 'application/vnd.google-apps.' + $scope.mimeType;
        var params = {
                      'parent': $scope.contact.entityKey,
                      'title':newdocument.title,
                      'mimeType':mimeType
                     };
        Attachement.insert($scope,params);

     };
     $scope.createPickerUploader = function() {
          var developerKey = 'AIzaSyCqpqK8oOc4PUe77_nNYNvzh9xhTWd_gJk';
          var projectfolder = $scope.contact.folder;
          var docsView = new google.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true);
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView().setParent(projectfolder)).
              addView(docsView).
              setCallback($scope.uploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId(987765099891).
                enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
              build();
          picker.setVisible(true);
      };
      // A simple callback implementation.
      $scope.uploaderCallback = function(data) {


        if (data.action == google.picker.Action.PICKED) {
                var params = {
                              'access': $scope.contact.access,
                              'parent':$scope.contact.entityKey
                            };
                params.items = new Array();

                 $.each(data.docs, function(index) {
                      console.log(data.docs);
                      /*
                      {'about_kind':'Account',
                      'about_item': $scope.account.id,
                      'title':newdocument.title,
                      'mimeType':mimeType };
                      */
                      var item = { 'id':data.docs[index].id,
                                  'title':data.docs[index].name,
                                  'mimeType': data.docs[index].mimeType,
                                  'embedLink': data.docs[index].url

                      };
                      params.items.push(item);

                  });
                 Attachement.attachfiles($scope,params);

          }
      }
      $scope.createLogoPickerUploader = function() {
           var developerKey = 'AIzaSyCqpqK8oOc4PUe77_nNYNvzh9xhTWd_gJk';
           var picker = new google.picker.PickerBuilder().
               addView(new google.picker.DocsUploadView()).
               setCallback($scope.logoUploaderCallback).
               setOAuthToken(window.authResult.access_token).
               setDeveloperKey(developerKey).
               setAppId(987765099891).
               build();
           picker.setVisible(true);
       };
       // A simple callback implementation.
       $scope.logoUploaderCallback = function(data) {
           if (data.action == google.picker.Action.PICKED) {
                 if(data.docs){
                   $scope.profile_img.profile_img_id = data.docs[0].id ;
                   $scope.profile_img.profile_img_url = 'https://docs.google.com/uc?id='+data.docs[0].id;
                   $scope.imageSrc = 'https://docs.google.com/uc?id='+data.docs[0].id;
                   $scope.$apply();
                   var params ={'id':$scope.contact.id};
                   params['profile_img_id'] = $scope.profile_img.profile_img_id;
                   params['profile_img_url'] = $scope.profile_img.profile_img_url;
                   Contact.patch($scope,params);
                 }
           }
       }
     $scope.renderMaps = function(){

          $scope.addresses = $scope.contact.addresses;
          Map.render($scope);
      };
      $scope.addAddress = function(address){
        var addressArray = undefined;
        if ($scope.contact.addresses){
          addressArray = new Array();
          addressArray = $scope.contact.addresses;
          addressArray.push(address);

        }else{
          addressArray = address;
        }
        Map.searchLocation($scope,address);

        $('#addressmodal').modal('hide');
        $scope.address={};
      };
      $scope.locationUpdated = function(addressArray){

          var params = {'id':$scope.contact.id,
                         'addresses':addressArray};
          Contact.patch($scope,params);
      };
       $scope.addGeo = function(address){
          params = {'parent':$scope.contact.entityKey,
            'kind':'addresses',
            'fields':[
                {
                  "field": "street",
                  "value": address.street
                },
                {
                  "field": "city",
                  "value": address.city
                },
                {
                  "field": "state",
                  "value": address.state
                },
                {
                  "field": "postal_code",
                  "value": address.postal_code
                },
                {
                  "field": "country",
                  "value": address.country
                }
            ]
          };
          if (address.lat){
            params = {'parent':$scope.contact.entityKey,
            'kind':'addresses',
            'fields':[
                {
                  "field": "street",
                  "value": address.street
                },
                {
                  "field": "city",
                  "value": address.city
                },
                {
                  "field": "state",
                  "value": address.state
                },
                {
                  "field": "postal_code",
                  "value": address.postal_code
                },
                {
                  "field": "country",
                  "value": address.country
                },
                {
                  "field": "lat",
                  "value": address.lat.toString()
                },
                {
                  "field": "lon",
                  "value": address.lon.toString()
                }
              ]
            };
          }
          InfoNode.insert($scope,params);
      };
  // HKA 13.05.2014 Delete infonode

  $scope.deleteInfonode = function(entityKey,kind){
    var params = {'entityKey':entityKey,'kind':kind};

    InfoNode.delete($scope,params);

  };
       //HKA 04.05.2014 To push element
  $scope.pushElement=function(elem,arr){
    console.log('Push Element -------------');
          if (arr.indexOf(elem) == -1) {
              var copyOfElement = angular.copy(elem);
              arr.push(copyOfElement);
              console.log(elem);
              $scope.initObject(elem);

          }else{
            alert("item already exit");
          }
      };
      $scope.listMoreOnScroll = function(){
        switch ($scope.selectedTab)
            {
            case 5:
              $scope.OpplistNextPageItems();
              break;
            case 6:
              $scope.CaselistNextPageItems();
              break;
            case 7:
              $scope.DocumentlistNextPageItems();
              break;
            case 1:
              $scope.TopiclistNextPageItems();
              break;

            }
      };
     // Google+ Authentication
     Auth.init($scope);
     $(window).scroll(function() {
          if (!$scope.isLoading && ($(window).scrollTop() >  $(document).height() - $(window).height() - 100)) {
              $scope.listMoreOnScroll();
          }
      });

}]);



app.controller('ContactNewCtrl', ['$scope','Auth','Contact','Account','Edge',
    function($scope,Auth,Contact,Account,Edge) {
      $("ul.page-sidebar-menu li").removeClass("active");
      $("#id_Contacts").addClass("active");

      document.title = "Contacts: New";
      $scope.isSignedIn = false;
      $scope.immediateFailed = false;
      $scope.nextPageToken = undefined;
      $scope.prevPageToken = undefined;
      $scope.isLoading = false;
      $scope.pagination = {};
      $scope.currentPage = 01;
      $scope.pages = [];
      $scope.stage_selected={};
      $scope.contacts = [];
      $scope.contact = {};
      $scope.contact.access ='public';
      $scope.order = '-updated_at';
      $scope.status = 'New';
      $scope.showPhoneForm=false;
      $scope.showEmailForm=false;
      $scope.showWebsiteForm=false;
      $scope.showSociallinkForm=false;
      $scope.showCustomFieldForm =false;
      $scope.phones=[];
      $scope.addresses=[];
      $scope.emails=[];
      $scope.websites=[];
      $scope.sociallinks=[];
      $scope.customfields=[];
      $scope.results=[];
      $scope.phone={};
      $scope.phone.type= 'work';
      $scope.imageSrc = '/static/img/avatar_contact.jpg';
      $scope.profile_img = {
                            'profile_img_id':null,
                            'profile_img_url':null
                          };
      $scope.createPickerUploader = function() {
          var developerKey = 'AIzaSyCqpqK8oOc4PUe77_nNYNvzh9xhTWd_gJk';
          var picker = new google.picker.PickerBuilder().
              addView(new google.picker.DocsUploadView()).
              setCallback($scope.uploaderCallback).
              setOAuthToken(window.authResult.access_token).
              setDeveloperKey(developerKey).
              setAppId(987765099891).
              build();
          picker.setVisible(true);
      };

      $scope.uploaderCallback = function(data) {
          if (data.action == google.picker.Action.PICKED) {
                if(data.docs){
                  $scope.profile_img.profile_img_id = data.docs[0].id ;
                  $scope.profile_img.profile_img_url = data.docs[0].url ;
                  $scope.imageSrc = 'https://docs.google.com/uc?id='+data.docs[0].id;
                  $scope.$apply();
                }
          }
      }
      $scope.initObject=function(obj){
          for (var key in obj) {
                obj[key]=null;
              }
      }
      $scope.pushElement=function(elem,arr){
          if (arr.indexOf(elem) == -1) {
              var copyOfElement = angular.copy(elem);
              arr.push(copyOfElement);
              console.log(elem);
              $scope.initObject(elem);
               $scope.phone.type= 'work';

          }else{
            alert("item already exit");
          }
      }
      $scope.runTheProcess = function(){

       };
        // We need to call this to refresh token when user credentials are invalid
       $scope.refreshToken = function() {
            Auth.refreshToken();
       };

       $scope.accountInserted = function(resp){
          $scope.contact.account = resp;
          $scope.save($scope.contact);
      };

       var params_search_account ={};
       $scope.result = undefined;
       $scope.q = undefined;
       $scope.$watch('searchAccountQuery', function() {
            console.log('i am searching');
           params_search_account['q'] = $scope.searchAccountQuery;
           Account.search($scope,params_search_account);

        });
        $scope.selectAccount = function(){
          $scope.contact.account = $scope.searchAccountQuery;

       };
       $scope.accountInserted = function(resp){
          console.log('account inserted ok');
          console.log(resp);
          $scope.contact.account = resp;
          $scope.save($scope.contact);
      };
       $scope.prepareInfonodes = function(){
        var infonodes = [];
        angular.forEach($scope.websites, function(website){
            var infonode = {
                            'kind':'websites',
                            'fields':[
                                    {
                                    'field':"url",
                                    'value':website.url
                                    }
                            ]

                          }
            infonodes.push(infonode);
        });
        angular.forEach($scope.sociallinks, function(sociallink){
            var infonode = {
                            'kind':'sociallinks',
                            'fields':[
                                    {
                                    'field':"url",
                                    'value':sociallink.url
                                    }
                            ]

                          }
            infonodes.push(infonode);
        });
        angular.forEach($scope.customfields, function(customfield){
            var infonode = {
                            'kind':'customfields',
                            'fields':[
                                    {
                                    'field':customfield.field,
                                    'value':customfield.value
                                    }
                            ]

                          }
            infonodes.push(infonode);
        });
        return infonodes;
    }
      // new Contact
     $scope.save = function(contact){
          var delayInsert = false;
          var params ={
                        'firstname':contact.firstname,
                        'lastname':contact.lastname,
                        'title':contact.title,
                        'tagline':contact.tagline,
                        'introduction':contact.introduction,
                        'phones':$scope.phones,
                        'emails':$scope.emails,
                        'addresses':$scope.addresses,
                        'infonodes':$scope.prepareInfonodes(),
                        'access': contact.access
                      };
          if (typeof(contact.account)=='object'){
              params['account'] = contact.account.entityKey;
          }else if($scope.searchAccountQuery){
              if ($scope.searchAccountQuery.length>0){
                // create a new account with this account name
                var accountparams = {
                                      'name': $scope.searchAccountQuery,
                                      'access': contact.access
                                    };
                $scope.contact = contact;
                Account.insert($scope,accountparams);
                delayInsert = true;
              };
          };
          if(!delayInsert){
            if ($scope.profile_img.profile_img_id){
                params['profile_img_id'] = $scope.profile_img.profile_img_id;
                params['profile_img_url'] = 'https://docs.google.com/uc?id='+$scope.profile_img.profile_img_id;
            }
            Contact.insert($scope,params);
          }

      };
      $scope.contactInserted = function(resp){
          window.location.replace('/#/contacts');
      }

      $scope.selectAccount = function(){
        $scope.contact.account = $scope.searchAccountQuery;

     };








   // Google+ Authentication
     Auth.init($scope);
}]);
