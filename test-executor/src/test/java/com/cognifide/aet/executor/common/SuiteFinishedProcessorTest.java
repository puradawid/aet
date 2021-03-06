/**
 * Automated Exploratory Tests
 *
 * Copyright (C) 2013 Cognifide Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.cognifide.aet.executor.common;

import com.google.common.collect.Lists;

import com.cognifide.aet.communication.api.messages.FinishedSuiteProcessingMessage;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class SuiteFinishedProcessorTest {

  private SuiteFinishedProcessor tested;

  @Mock
  private FinishedSuiteProcessingMessage reportMessage;

  @Mock
  private RunnerTerminator runnerTerminator;

  @Before
  public void setUp() {
    when(reportMessage.getStatus()).thenReturn(FinishedSuiteProcessingMessage.Status.OK);
    tested = new SuiteFinishedProcessor(reportMessage, runnerTerminator);
  }

  @Test
  public void processTest() {
    tested.process();

    verify(runnerTerminator, times(1)).finish();
  }

  @Test
  public void processTest_error() {
    when(reportMessage.getStatus()).thenReturn(FinishedSuiteProcessingMessage.Status.FAILED);
    when(reportMessage.getErrors()).thenReturn(Lists.newArrayList("Error1", "Error2", "Error3"));

    tested.process();

    verify(reportMessage, times(1)).getErrors();
    verify(runnerTerminator, times(1)).finish();
  }
}
