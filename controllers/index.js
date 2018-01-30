// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.mod_questionnaire')

/**
 * Questionnaire index controller.
 *
 * @module mm.addons.mod_questionnaire
 * @ngdoc controller
 * @name mmaModQuestionnaireIndexCtrl
 */
.controller('mmaModQuestionnaireIndexCtrl', function($scope, $stateParams, $mmaModQuestionnaire, $mmUtil, $mmCourseHelper, $q, $mmCourse, $mmText,
            mmaModQuestionnaireComponent, $mmSite, $mmEvents, $ionicScrollDelegate, $mmApp, $translate, mmCoreEventOnlineStatusChanged) {
    var module = $stateParams.module || {},
        courseId = $stateParams.courseid,
        questionnaire,
        userId = $mmSite.getUserId(),
        cmId = module.id;

    $scope.title = module.name;
    $scope.description = module.intro;
    $scope.moduleUrl = module.url;
    $scope.courseId = courseId;
    $scope.userId = userId;
    $scope.component = mmaModQuestionnaireComponent;
    $scope.componentId = cmId;
    
    // Convenience function to get questionnaire data.
    function fetchQuestionnaireData(refresh, sync, showErrors) {
        return $mmaModQuestionnaire.getQuestionnaireData(cmId, userId).then(function(data) {
            questionnaire = data;

            $scope.title = questionnaire.questionnaire.name || $scope.title;
            $scope.description = questionnaire.questionnaire.intro || $scope.description;
            $scope.questionsinfo = questionnaire.questionsinfo;
            $scope.questions = questionnaire.questions;
        })/*.then(function() {
            // Check if there are responses stored in offline.
            return $mmaModQuestionnaireOffline.hasResponse(questionnaire.id);
        }).then(function(hasOffline) {
            $scope.hasOffline = hasOffline;

            // We need fetchOptions to finish before calling fetchResults because it needs hasAnsweredOnline variable.
            return fetchOptions(hasOffline).then(function() {
                return fetchResults();
            });
        }).then(function() {
            // All data obtained, now fill the context menu.
            $mmCourseHelper.fillContextMenu($scope, module, courseId, refresh, mmaModQuestionnaireComponent);
        }).catch(function(message) {
            if (!refresh) {
                // Some call failed, retry without using cache since it might be a new activity.
                return refreshAllData(sync);
            }

            if (message) {
                $mmUtil.showErrorModal(message);
            } else {
                $mmUtil.showErrorModal('mma.mod_questionnaire.errorgetquestionnaire', true);
            }
            return $q.reject();
        })*/;
    }

    // Convenience function to get Questionnaire data.
    /*function fetchQuestionnaire(refresh) {
        return 'ffddd';
    }*/

    // Convenience function to refresh all the data.
    function refreshAllData(sync, showErrors) {
        var p1 = $mmaModQuestionnaire.invalidateQuestionnaireData(cmId),
            p2 = questionnaire ? $mmaModQuestionnaire.invalidateOptions(questionnaire.id) : $q.when(),
            p3 = questionnaire ? $mmaModQuestionnaire.invalidateResults(questionnaire.id) : $q.when();

        return $q.all([p1, p2, p3]).finally(function() {
            return fetchQuestionnaireData(true, sync, showErrors);
        });
    }
    
    fetchQuestionnaireData(false, true).then(function() {
        
    }).finally(function() {
        $scope.questionnaireLoaded = true;
        $scope.refreshIcon = 'ion-refresh';
        $scope.syncIcon = 'ion-loop';
    });
    /*fetchQuestionnaireData(false, true).then(function() {
        $mmaModQuestionnaire.logView(choice.id).then(function() {
            $mmCourse.checkModuleCompletion(courseId, module.completionstatus);
        });
    }).finally(function() {
        $scope.choiceLoaded = true;
        $scope.refreshIcon = 'ion-refresh';
        $scope.syncIcon = 'ion-loop';
    });*/

});
