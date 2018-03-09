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

            $scope.questionnaire = questionnaire.questionnaire;
            $scope.title = questionnaire.questionnaire.name || $scope.title;
            $scope.description = questionnaire.questionnaire.intro || $scope.description;
            $scope.response = questionnaire.response;
            $scope.questionsinfo = questionnaire.questionsinfo;
            $scope.questions = questionnaire.questions;
        });
    }

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

    // Save data.
    $scope.save = function() {
        // Only show confirm if questionnaire doesn't allow update.
        $mmUtil.showConfirm($translate('mm.core.areyousure')).then(function() {
            var responses = [];
            angular.forEach($scope.questions, function(question, questionid) {
                responses[questionid] = [{id:1, question_id: 0, choice_id: 0, content: "", value: -9999}];
                angular.forEach(question, function(qitem) {
                    if (qitem.value !== '' && qitem.value !== -9999 && qitem.value !== null) {
                        responses[questionid].push(JSON.parse(angular.toJson(qitem)));
                    }
                });
            });

            var modal = $mmUtil.showModalLoading('mm.core.sending', true);
            $mmaModQuestionnaire.submitResponse(questionnaire.questionnaire.id, responses, userId).then(function() {
                // Success!
                // Check completion since it could be configured to complete once the user answers the questionnaire.
                $mmCourse.checkModuleCompletion(courseId, module.completionstatus);
                // Let's refresh the data.
                return refreshAllData(false);
            }).catch(function(message) {
                if (message) {
                    $mmUtil.showErrorModal(message);
                } else {
                    $mmUtil.showErrorModal('mma.mod_questionnaire.cannotsubmit', true);
                }
            }).finally(function() {
                modal.dismiss();
            });
        });
    };
});

angular.module('mm.addons.mod_questionnaire')
.filter('htmlToPlaintext', function() {
    return function(text) {
        return angular.element(text).text();
    };
});

angular.module('mm.addons.mod_questionnaire')
.filter('num5', function() {
    return function(data) {
        if (data < 5) {
            return data+1;
        } else {
            return (data % 5)+1;
        }
    };
});