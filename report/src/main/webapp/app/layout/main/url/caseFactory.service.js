/*
 * Automated Exploratory Tests
 *
 * Copyright (C) 2013 Cognifide Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(['angularAMD', 'artifactsService'], function (angularAMD) {
  'use strict';
  angularAMD.factory('caseFactory', CaseFactoryService);

  /**
   * Service responsible for producing case that is displayed on report.
   */
  function CaseFactoryService($rootScope, artifactsService) {
    var service = {
      getCase: getCase
    };

    return service;

    function getCase(step, comparator, index) {
      return new BasicCaseModel(step, comparator, index, artifactsService);
    }

  }

  /**
   * Represents case model that is created from:
   * @param step - step object in which case exists.
   * @param comparator - case comparator model.
   * @param index - index of comparator in step
   * @param artifactsService
   */
  function BasicCaseModel(step, comparator, index, artifactsService) {
    var caseModel = {
      update: update,
      getPatternUrl: getPatternUrl,
      getPatternArtifact: getPatternArtifact,
      getDataUrl: getDataUrl,
      getDataArtifact: getDataArtifact,
      getResultUrl: getResultUrl,
      getResultArtifact: getResultArtifact
    }, templateProvider = new ExtensionsTemplateProvider();

    setup();

    return caseModel;

    function getPatternUrl() {
      return hasPattern() ? artifactsService.getArtifactUrl(caseModel.step.pattern) : null;
    }

    function getPatternArtifact() {
      caseModel.pattern = {};
      if (hasPattern()) {
        artifactsService.getArtifact(caseModel.step.pattern).then(function (data) {
          caseModel.pattern = data;
        }).catch(function (e) {
          console.log(e);
        });
      }
    }

    function getDataUrl() {
      return hasData() ?
             artifactsService.getArtifactUrl(caseModel.step.stepResult.artifactId) : null;
    }

    function getDataArtifact() {
      caseModel.data = {};
      if (hasData()) {
        artifactsService.getArtifact(caseModel.step.stepResult.artifactId).then(function (data) {
          caseModel.data = data;
        }).catch(function (e) {
          console.log(e);
        });
      }
    }

    function getResultUrl() {
      return hasResult() ?
             artifactsService.getArtifactUrl(caseModel.comparator.stepResult.artifactId) : null;
    }

    function getResultArtifact() {
      caseModel.result = {};
      if (hasResult()) {
        artifactsService.getArtifact(caseModel.comparator.stepResult.artifactId)
            .then(function (data) {
              caseModel.result = data;
            }).catch(function (e) {
              console.log(e);
        });
      }
    }

    function update() {
      caseModel.displayName = getCaseDisplayName(step, comparator);
      var stepResult = comparator.stepResult;
      caseModel.showAcceptButton =
          stepResult && stepResult.rebaseable && stepResult.status === 'FAILED';
      caseModel.showRevertButton = comparator.hasNotSavedChanges;
      caseModel.index = index;
      caseModel.status = getCaseStatus(step, comparator);

      if (caseModel.status === 'PROCESSING_ERROR') {
        caseModel.errors = getCaseErrors(step, comparator);
        caseModel.getTemplate = function () {
          return 'app/layout/main/url/errors/processingError.html';
        };
      } else {
        caseModel.getTemplate = function () {
          return templateProvider.getTemplateUrl(step, comparator);
        };
      }
    }

    /***************************************
     ***********  Private methods  *********
     ***************************************/

    function setup() {
      caseModel.comparator = comparator;
      caseModel.step = step;

      update();
      
      getResultArtifact();
    }

    function getCaseDisplayName(step, comparator) {
      var displayName = comparator.type;
      if (step.parameters && step.parameters.name) {
        displayName += ' ' + step.parameters.name;
      } else if (comparator.parameters && comparator.parameters.comparator) {
        displayName += ' ' + comparator.parameters.comparator;
      }
      return displayName;
    }

    function getCaseStatus(step, comparator) {
      var status;
      if (comparator.stepResult) {
        status =
            comparator.stepResult.status ? comparator.stepResult.status : step.stepResult.status;
      } else {
        status = step.stepResult ? step.stepResult.status : 'PROCESSING_ERROR';
      }
      return status;
    }

    function getCaseErrors(step, comparator) {
      var errors;
      if (comparator.stepResult) {
        errors =
            comparator.stepResult.errors ? comparator.stepResult.errors : step.stepResult.errors;
      } else {
        errors = step.stepResult ? step.stepResult.errors : 'Unknown error';
      }
      return errors;
    }

    function hasData() {
      return caseModel.step.stepResult && caseModel.step.stepResult.artifactId;
    }

    function hasPattern() {
      return caseModel.step && caseModel.step.pattern;
    }

    function hasResult() {
      return caseModel.comparator.stepResult && caseModel.comparator.stepResult.artifactId;
    }

  }

  /**
   * Provides path to template for each type.
   */
  function ExtensionsTemplateProvider() {
    var service = {
      getTemplateUrl: getTemplateUrl
    };

    return service;

    function getTemplateUrl(step, comparator) {
      var type = step.type,
          comparatorAlgorithm = comparator.parameters ? comparator.parameters.comparator : null,
          templateName;

      if (comparatorAlgorithm && comparatorAlgorithm !== type) {
        templateName = comparatorAlgorithm ? type + '_' + comparatorAlgorithm : type;
      } else {
        templateName = type;
      }

      return 'app/layout/main/url/reports/' + templateName + '.html';
    }
  }

});
