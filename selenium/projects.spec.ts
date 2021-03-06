/* Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {By, Key, until} from 'selenium-webdriver';
import build from './driver';


const projectName = 'Automated Test Project ' + new Date().getTime();
const packageName = 'ZZZ Automated Test Package ' + new Date().getTime();

describe('project management', function () {
  let driver;
  beforeAll(async function (done) {
    driver = await build();
    await driver.manage().timeouts().implicitlyWait(1000);
    done();
  });
  afterAll(async function (done) {
    await driver.quit();
    done();
  });

  it('loads the form', async function (done) {
    driver.get('http://0.0.0.0:8000/projects/new');
    await driver.wait(until.elementLocated(By.id('onboarding-form')));
    done();
  });

  it('shows an error with invalid values', async function (done) {
    // fill out the form
    driver.findElement(By.id('title')).sendKeys(projectName);
    driver.findElement(By.id('version')).sendKeys('0.0.0-integration-test');
    driver.findElement(By.id('description')).sendKeys('An automated test project of little significance');
    driver.findElement(By.css('input[name="openSourcing"][value="false"]')).click();
    driver.findElement(By.id('businessLawyer')).sendKeys('not a real person');
    driver.findElement(By.id('plannedRelease')).sendKeys('1111-11-11');

    // pick an owner from the fancy dropdown
    driver.findElement(By.css('#ownerGroup-container .Select-placeholder')).click();
    driver.findElement(By.css('#ownerGroup-container .Select-option[data-reactid*="everyone"]')).click();

    // try to submit the form
    driver.findElement(By.css('form#onboarding-form button[type="submit"]')).click();
    const errorText = await driver.findElement(By.css('#error-modal .modal-body')).getText();
    expect(errorText).toContain('\'not a real person\' doesn\'t exist');
    await driver.findElement(By.css('#error-modal button.btn-primary')).click(); // close button

    done();
  });

  it('accepts a corrected form and loads the project', async function (done) {
    // correct the BLL field & submit
    const bllField = driver.findElement(By.id('businessLawyer'));
    bllField.clear();
    bllField.sendKeys('peddicor'); // I'm still vain
    driver.findElement(By.css('form#onboarding-form button[type="submit"]')).click();

    // see that the project page loaded
    const headerText = await driver.findElement(By.id('project-heading')).getText();
    expect(headerText).toContain(projectName);

    done();
  });

  it('has editable fields', async function (done) {
    driver.findElement(By.css('#project-open-sourcing .EditableText')).click();
    driver.findElement(By.css('#project-open-sourcing select > option[value="true"]')).click();
    const ele = driver.findElement(By.css('#project-open-sourcing select'));
    ele.sendKeys(Key.ENTER);
    await driver.findElement(By.xpath('//*[@id="project-open-sourcing"]/span[text()="Yes"]'));

    done();
  });

  it('does not yet have a build button', async function (done) {
    // implicit wait WILL get triggered here, even though we don't really want it
    const present = await driver.findElements(By.id('build-buttons'));
    expect(present.length).toEqual(0);

    done();
  });

  it('can fill out the add package form', async function (done) {
    driver.findElement(By.id('add-package')).click();

    // fancy dropdown
    driver.findElement(By.css('#package-container .Select-placeholder')).click();
    driver.findElement(By.css('#package-container .Select-input input')).sendKeys(packageName);
    const createOption = driver.findElement(By.css('#package-container .Select-option:last-child'));
    const createText = await createOption.getText();
    expect(createText).toContain('Create package');
    createOption.click();

    // fill out the rest of the form
    driver.findElement(By.id('packageVersion')).sendKeys('0.0.0');
    driver.findElement(By.id('packageWebsite')).sendKeys('example.com');
    driver.findElement(By.id('packageLicenseText')).sendKeys('Sample full text\nof\na\nlicense');
    driver.findElement(By.id('packageCopyright')).sendKeys('Copyright (c) 20XX Fox McCloud');
    driver.findElement(By.id('packageModifiedYes')).click();
    driver.findElement(By.id('packageDynamicLink')).click();
    driver.findElement(By.id('packageComments')).sendKeys('dota is a video game');

    // let everything in the above chain resolve since we're not expecting anything here
    await driver.sleep(0);

    done();
  });

  it('gets an error about the url', async function (done) {
    driver.findElement(By.css('#add-package-form button[type="submit"]')).click();
    const text = await driver.findElement(By.css('#error-modal .modal-body')).getText();
    expect(text).toContain('not a real URL');
    await driver.findElement(By.css('#error-modal button.btn-primary')).click(); // close button

    done();
  });

  it('can successfully add a package', async function (done) {
    const field = await driver.findElement(By.id('packageWebsite'));
    field.clear();
    field.sendKeys('http://example.com');
    driver.findElement(By.css('#add-package-form button[type="submit"]')).click();

    // package should have been added
    const ele = await driver.findElement(By.css('.package-card h4'));
    await driver.wait(until.elementTextContains(ele, packageName), 1000);

    done();
  });

  it('can delete that package', async function (done) {
    driver.findElement(By.className('package-remove-button')).click();
    driver.findElement(By.css('.package-remove-button.btn-danger')).click();
    await driver.wait(async () => {
      return (await driver.findElements(By.className('package-card'))).length === 0;
    });

    done();
  });

  it('can re-add the package', async function (done) {
    driver.findElement(By.id('add-package')).click();

    // fancy dropdown again
    driver.findElement(By.css('#package-container .Select-placeholder')).click();
    driver.findElement(By.css('#package-container .Select-input input')).sendKeys(packageName);
    // wait for results to load (should be one that isn't the create option)
    await driver.wait(until.elementLocated(By.xpath('//*[@id="package-container"]//*[contains(@class, "Select-option")][not(contains(text(), "Create"))]')));
    const existingOption = await driver.findElement(By.css('#package-container .Select-option:first-child'));

    const existingText = await existingOption.getText();
    expect(existingText).toContain(`${packageName} (0.0.0)`);
    existingOption.click();

    // shouldn't be a version field here now
    const versionField = await driver.findElements(By.id('packageVersion'));
    expect(versionField.length).toEqual(0);

    // fill out the rest of the form again
    driver.findElement(By.id('packageModifiedYes')).click();
    driver.findElement(By.id('packageDynamicLink')).click();
    driver.findElement(By.id('packageComments')).sendKeys('dota is a game that will make you frustrated');

    // submit and check for card
    driver.findElement(By.css('#add-package-form button[type="submit"]')).click();
    const ele = await driver.findElement(By.css('.package-card h4'));
    await driver.wait(until.elementTextContains(ele, packageName), 1000);

    done();
  });

  it('can preview the document', async function (done) {
    driver.findElement(By.css('#build-buttons a')).click();
    const ele = await driver.findElement(By.css('#attribution-document-text pre'));
    await driver.wait(until.elementTextContains(ele, 'Sample full text'));

    done();
  });

});
