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

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { PackageUsage, WebProject } from '../../../../server/api/projects/interfaces';
import * as ProjectActions from '../../../modules/projects';
import PackageFields, { PkgOutput } from './PackageFields';
import UsageFields from './UsageFields';

interface Props {
  onCompleted: Function;

  dispatch: any;
  project: WebProject;
}

interface State {
  pkg: PkgOutput;
  usage: Partial<PackageUsage>;
}

/**
 * A form used to attach (optionally create) a package to a project.
 */
class AddPackageForm extends Component<Props, Partial<State>> {

  constructor() {
    super();

    this.state = {
      pkg: null,
      usage: {},
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    // do nothing if no package entered
    if (this.state.pkg == null) {
      return;
    }

    const { dispatch, onCompleted, project: { projectId } } = this.props;
    const {
      pkg: { packageId, name, version, website, copyright, license, licenseText },
      usage: { modified, link, notes },
    } = this.state;

    await dispatch(ProjectActions.attachPackageToProject(projectId, {
      packageId,
      name, version, website,
      copyright, license, licenseText,
      modified, link, notes,
    }));

    window.sessionStorage.setItem('package_help_shown', '1');
    onCompleted();
  }

  handlePkgChanged = (pkg) => {
    this.setState({pkg});
  }

  handleUsageChanged = (usage) => {
    this.setState({usage});
  }

  render() {
    return (
      <form id="add-package-form" className="form mt-4" onSubmit={this.handleSubmit}>

        <h4>Package Details</h4>
        {this.renderPackageHelp()}
        <PackageFields onChange={this.handlePkgChanged} />

        <h4>Usage details</h4>
        <UsageFields onChange={this.handleUsageChanged} />

        <button type="submit" className="btn btn-primary">
          <i className="fa fa-plus" /> Add
        </button>

      </form>
    );
  }

  renderPackageHelp() {
    // only show once per session
    if (window.sessionStorage.getItem('package_help_shown') != null) {
      return;
    }

    return (
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-block">
              <h5 className="card-heading">How to identify licenses and copyrights</h5>
              <div className="card-text">
                <small>(This message is only shown once per session.)</small>

                <p style={{textAlign: 'center'}}>
                  <img src="/assets/images/copyright-vs-license.png" className="img-rounded" alt="Copyright/license example" style={{ width: '100%', maxWidth: '700px' }} />
                </p>
                <p>
                  Note that projects may do things differently.
                  A copyright statement may not always be in these files; it may be present in the headers of the source code instead. Sometimes it is present in the README.
                </p>
                <p>
                  If the package you're using has a NOTICE file, it often includes a copyright statement. You can include the NOTICE file in same box below.
                </p>

                <h5>Identifying a License</h5>

                <p>
                  Licenses often state their name towards the top of the license text.
                  Some licenses don't; these are frequently MIT or BSD variants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default connect((state) => ({
  project: state.projects.active,
}))(AddPackageForm) as React.ComponentClass<Partial<Props>>;
// type re-casted with prop information since not all props are redux-supplied
