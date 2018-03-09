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
     * Get a questionnaire with key=value. If more than one is found, only the first will be returned.
     *
     * @param  {String}     siteId          Site ID.
     * @param  {Number}     courseId        Course ID.
     * @param  {String}     key             Name of the property to check.
     * @param  {Mixed}      value           Value to search.
     * @param  {Boolean}    [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return {Promise}                    Promise resolved when the questionnaire is retrieved.
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

            return site.read('mod_questionnaire_get_questionnaire_data', params, preSets).then(function(response) {
                if (response) {
                    return response;
                }
                return $q.reject();
            });
        });
    }
    
    /**
     * Get cache key for questionnaire data WS calls.
     *
     * @param {Number} courseid Course ID.
     * @return {String}         Cache key.
     */
    function getQuestionnaireDataCacheKey(cmId) {
        return 'mmaModQuestionnaire:questionnaire:' + cmId;
    }
    
    /**
     * Get cache key for questionnaire options WS calls.
     *
     * @param {Number} questionnaireid Questionnaire ID.
     * @return {String}     Cache key.
     */
    function getQuestionnaireOptionsCacheKey(questionnaireid) {
        return 'mmaModQuestionnaire:options:' + questionnaireid;
    }
    
    /**
     * Get cache key for questionnaire results WS calls.
     *
     * @param {Number} questionnaireid Questionnaire ID.
     * @return {String}     Cache key.
     */
    function getQuestionnaireResultsCacheKey(questionnaireid) {
        return 'mmaModQuestionnaire:results:' + questionnaireid;
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
     * Invalidates questionnaire data.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#invalidateQuestionnaireData
     * @param {Number} courseid Course ID.
     * @return {Promise}        Promise resolved when the data is invalidated.
     */
    self.invalidateQuestionnaireData = function(cmId) {
        return $mmSite.invalidateWsCacheForKey(getQuestionnaireDataCacheKey(cmId));
    };
    
    /**
     * Invalidates options.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#invalidateOptions
     * @param {Number} questionnaireId     Questionnaire ID.
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
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#invalidateResults
     * @param {Number} questionnaireId     QuestionnaireId ID.
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
     * Get a questionnaire by course module ID.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#getQuestionnaire
     * @param   {Number}    courseId        Course ID.
     * @param   {Number}    cmId            Course module ID.
     * @param   {String}    [siteId]        Site ID. If not defined, current site.
     * @param   {Boolean}   [forceCache]    True to always get the value from cache, false otherwise. Default false.
     * @return  {Promise}                   Promise resolved when the questionnaire is retrieved.
     */
    self.getQuestionnaireData = function(cmId, userId, siteId, forceCache) {
        siteId = siteId || $mmSite.getId();
        return getQuestionnaireData(siteId, cmId, userId, forceCache);
    };
    
    /**
     * Send a response to a questionnaire to Moodle. It will fail if offline or cannot connect.
     *
     * @module mm.addons.mod_questionnaire
     * @ngdoc method
     * @name $mmaModQuestionnaire#submitResponseOnline
     * @param  {Number}   questionnaireId  Questionnaire ID.
     * @param  {Number[]} responses IDs of selected options.
     * @param  {String}   [siteId]  Site ID. If not defined, current site.
     * @return {Promise}            Promise resolved when responses are successfully submitted.
     */
    self.submitResponse = function(questionnaireId, responses, userId) {
        var siteId = $mmSite.getId();

        return $mmSitesManager.getSite(siteId).then(function(site) {
            var params = {
                questionnaireid: questionnaireId,
                userid: userId,
                responses: responses
            };

            return site.write('mod_questionnaire_submit_questionnaire_response', params).catch(function(error) {
                return $q.reject({
                    error: error,
                    wserror: $mmUtil.isWebServiceError(error)
                });
            }).then(function() {
                // Invalidate related data.
                var promises = [
                    self.invalidateOptions(questionnaireId, siteId),
                    self.invalidateResults(questionnaireId, siteId)
                ];
                return $q.all(promises).catch(function() {
                    // Ignore errors.
                });
            });
        });
    };

    return self;
});