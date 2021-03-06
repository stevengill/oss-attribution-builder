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

/**
 * An interface for handling back-end user look-up.
 *
 * Implementations of this interface must be activated by specifying the
 * name of the module in your site configuration.
 *
 * For a sample implementation, see `nullauth`.
 */
interface AuthBase {

  /**
   * Given an Express request object, return the username of the current user.
   *
   * If sitting behind a trusted proxy, you can often pull this out of
   * a header. If you have more custom authentication (say, a Passport hook),
   * you may need to store data in the request object via middleware and
   * then read it here.
   */
  extractRequestUser(request: any): string;

  /**
   * Given a username, look up the display name. Return null if the user
   * does not exist.
   *
   * For example, you could look up a user's full name in LDAP/AD.
   */
  getDisplayName(user: string): Promise<string>;

  /**
   * Given a username, look up the list of groups the user is a member of.
   * Groups should, ideally, be prefixed with the group type, or at least
   * some token to distinguish them from user accounts. Project ACLs specify
   * users and groups in the same namespace, so it's on the auth backend to
   * separate these appropriately.
   *
   * For example, you could return `['ldap:group1', 'ldap:group2', 'custom:another-group']`.
   */
  getGroups(user: string): Promise<string[]>;

}

export default AuthBase;
