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

// Meta-tag; see "all"

export function validateSelf(name, text, tags) {
  const proper = name != null ? `${name}` : 'This license';
  return [
    {level: 1, message: `${proper} is not known by our system. Review this license carefully to ensure you comply with its terms.`},
  ];
}

export function validateUsage(usage) {

}
