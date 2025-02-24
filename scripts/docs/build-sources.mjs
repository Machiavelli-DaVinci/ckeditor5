/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import upath from 'upath';
import fs from 'fs-extra';
import { CKEDITOR5_ROOT_PATH, CKEDITOR5_COMMERCIAL_PATH } from '../constants.mjs';
import generateCKEditor5DocsBuild from './generate-ckeditor5-docs-build.mjs';

export default async function buildSources() {
	const { version } = await fs.readJson( upath.join( CKEDITOR5_ROOT_PATH, 'package.json' ) );
	const basePath = upath.join( CKEDITOR5_ROOT_PATH, 'build/docs/ckeditor5', version, 'assets' );

	const output = getOutputFactory( basePath );

	await generateCKEditor5DocsBuild( output( 'ckeditor5/ckeditor5.js' ) );

	if ( await fs.pathExists( CKEDITOR5_COMMERCIAL_PATH ) ) {
		const { default: generateCKEditor5PremiumFeaturesDocsBuild } = await import(
			'../../external/ckeditor5-commercial/scripts/docs/generate-ckeditor5-premium-features-docs-build.mjs'
		);

		await generateCKEditor5PremiumFeaturesDocsBuild( output( 'ckeditor5-premium-features/ckeditor5-premium-features.js' ) );
	}
}

function getOutputFactory( basePath ) {
	return path => upath.join( basePath, path );
}
