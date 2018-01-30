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
 * Questionnaire service.
 *
 * @module mm.addons.mod_questionnaire
 * @ngdoc service
 * @name $mmaModQuestionnaire
 */
.factory('$mmaModQuestionnaire', function($q, $mmSite, $mmFS, $mmUtil, $mmSitesManager, mmaModQuestionnaireComponent, $mmFilepool) {
    var self = {};

    /**
     * Get a Questionnaire.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#getQuestionnaire
     * @param {Number} courseId Course ID.
     * @param {Number} cmId     Course module ID.
     * @return {Promise}        Promise resolved when the Questionnaire is retrieved.
     */
    self.getQuestionnaire = function(courseId, cmId) {
        /*var params = {
                courseids: [courseId]
            },
            preSets = {
                cacheKey: getQuestionnaireCacheKey(courseId)
            };

        /*return $mmSite.read('mod_questionnaire_get_questionnaires_by_courses', params, preSets).then(function(response) {
            if (response.questionnaires) {
                var currentQuestionnaire;
                angular.forEach(response.questionnaires, function(questionnaire) {
                    if (questionnaire.coursemodule == cmId) {
                        currentQuestionnaire = questionnaire;
                    }
                });
                if (currentQuestionnaire) {
                    return currentQuestionnaire;
                }
            }
            return $q.reject();
        });*/
        return 'ttttt';
    };
    
    /**
     * Get a choice with key=value. If more than one is found, only the first will be returned.
     *
     * @param  {String}     siteId          Site ID.
     * @param  {Number}     courseId        Course ID.
     * @param  {String}     key             Name of the property to check.
     * @param  {Mixed}      value           Value to search.
     * @param  {Boolean}    [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return {Promise}                    Promise resolved when the choice is retrieved.
     */
    function getQuestionnaireData(siteId, cmId, userId, forceCache) {
        return $mmSitesManager.getSite(siteId).then(function(site) {
            var params = {
                    cmId: cmId,
                    userId: userId
                },
                preSets = {
                    cacheKey: getQuestionnaireDataCacheKey(cmId)
                };

            /*if (forceCache) {
                preSets.omitExpires = true;
            }*/

            return site.read('mod_questionnaire_get_questionnaire_data', params, preSets).then(function(response) {console.log('ddddd');console.dir(response);
                if (response) {
                    return response;
                    /*var currentChoice;
                    angular.forEach(response.choices, function(choice) {
                        if (!currentChoice && choice[key] == value) {
                            currentChoice = choice;
                        }
                    });
                    if (currentChoice) {
                        return currentChoice;
                    }*/
                }
                return $q.reject();
            });
        });
    }

    /**
     * Get issued questionnaires.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#getIssuedQuestionnaires
     * @param {Number} id Questionnaire ID.
     * @return {Promise}  Promise resolved when the issued data is retrieved.
     */
    self.getIssuedQuestionnaires = function(id) {
        /*var params = {
                questionnaireid: id
            },
            preSets = {
                cacheKey: getIssuedQuestionnairesCacheKey(id)
            };

        /*return $mmSite.read('mod_questionnaire_get_issued_questionnaires', params, preSets).then(function(response) {
            if (response.issues) {
                return response.issues;
            }
            return $q.reject();
        });*/
        return 'ddddfff';
    };
    
    /**
     * Get cache key for choice data WS calls.
     *
     * @param {Number} courseid Course ID.
     * @return {String}         Cache key.
     */
    function getQuestionnaireDataCacheKey(cmId) {
        return 'mmaModQuestionnaire:questionnaire:' + cmId;
    }
    
    /**
     * Get cache key for choice options WS calls.
     *
     * @param {Number} choiceid Choice ID.
     * @return {String}     Cache key.
     */
    function getQuestionnaireOptionsCacheKey(questionnaireid) {
        return 'mmaModQuestionnaire:options:' + questionnaireid;
    }
    
    /**
     * Get cache key for choice results WS calls.
     *
     * @param {Number} choiceid Choice ID.
     * @return {String}     Cache key.
     */
    function getQuestionnaireResultsCacheKey(choiceid) {
        return 'mmaModQuestionnaire:results:' + choiceid;
    }

    /**
     * Return whether or not the plugin is enabled in a certain site. Plugin is enabled if the questionnaire WS are available.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#isPluginEnabled
     * @param  {String} [siteId] Site ID. If not defined, current site.
     * @return {Promise}         Promise resolved with true if plugin is enabled, rejected or resolved with false otherwise.
     */
    self.isPluginEnabled = function(siteId) {
        siteId = siteId || $mmSite.getId();

        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.wsAvailable('mod_questionnaire_get_questionnaire_data');
        });
    };
    
    /**
     * Invalidates choice data.
     *
     * @module mm.addons.mod_choice
     * @ngdoc method
     * @name $mmaModChoice#invalidateChoiceData
     * @param {Number} courseid Course ID.
     * @return {Promise}        Promise resolved when the data is invalidated.
     */
    self.invalidateQuestionnaireData = function(cmId) {
        return $mmSite.invalidateWsCacheForKey(getQuestionnaireDataCacheKey(cmId));
    };
    
    /**
     * Invalidates options.
     *
     * @module mm.addons.mod_choice
     * @ngdoc method
     * @name $mmaModChoice#invalidateOptions
     * @param {Number} choiceId     Choice ID.
     * @param {String} [siteId]     Site ID. If not defined, current site.
     * @return {Promise}            Promise resolved when the data is invalidated.
     */
    self.invalidateOptions = function(questionnaireId, siteId) {
        siteId = siteId || $mmSite.getId();

        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.invalidateWsCacheForKey(getQuestionnaireOptionsCacheKey(questionnaireId));
        });
    };
    
    /**
     * Invalidates results.
     *
     * @module mm.addons.mod_choice
     * @ngdoc method
     * @name $mmaModChoice#invalidateResults
     * @param {Number} choiceId     Choice ID.
     * @param {String} [siteId]     Site ID. If not defined, current site.
     * @return {Promise}            Promise resolved when the data is invalidated.
     */
    self.invalidateResults = function(questionnaireId, siteId) {
        siteId = siteId || $mmSite.getId();

        return $mmSitesManager.getSite(siteId).then(function(site) {
            return site.invalidateWsCacheForKey(getQuestionnaireResultsCacheKey(questionnaireId));
        });
    };
    
    /**
     * Report the choice as being viewed.
     *
     * @module mm.addons.mod_choice
     * @ngdoc method
     * @name $mmaModChoice#logView
     * @param {String} id Choice ID.
     * @return {Promise}  Promise resolved when the WS call is successful.
     */
    self.logView = function(id) {
        if (id) {
            var params = {
                questionnaireid: id
            };
            return $mmSite.write('mod_choice_view_choice', params);
        }
        return $q.reject();
    };
    
    /**
     * Get a choice by course module ID.
     *
     * @module mm.addons.mod_choice
     * @ngdoc method
     * @name $mmaModChoice#getChoice
     * @param   {Number}    courseId        Course ID.
     * @param   {Number}    cmId            Course module ID.
     * @param   {String}    [siteId]        Site ID. If not defined, current site.
     * @param   {Boolean}   [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return  {Promise}                   Promise resolved when the choice is retrieved.
     */
    self.getQuestionnaireData = function(cmId, userId, siteId, forceCache) {
        siteId = siteId || $mmSite.getId();
        return getQuestionnaireData(siteId, cmId, userId, forceCache);
    };

    /**
     * Invalidate downloaded questionnaires.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#invalidateDownloadedQuestionnaires
     * @param {Number} moduleId Module id.
     * @return {Promise}  Promise resolved when the WS call is successful.
     */
    self.invalidateDownloadedQuestionnaires = function(moduleId) {
        return $mmFilepool.invalidateFilesByComponent($mmSite.getId(), mmaModQuestionnaireComponent, moduleId);
    };

    return self;
});