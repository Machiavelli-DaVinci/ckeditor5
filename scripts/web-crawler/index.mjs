#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import minimist from 'minimist';
import { DEFAULT_CONCURRENCY, runCrawler, toArray, isUrlValid } from '@ckeditor/ckeditor5-dev-web-crawler';

const options = parseArguments( process.argv.slice( 2 ) );

runCrawler( options );

/**
 * Parses CLI arguments and prepares configuration for the crawler.
 *
 * @param {Array.<String>} args CLI arguments and options.
 * @returns {Object} options
 * @returns {String} options.url The URL to start crawling.
 * @returns {Number} options.depth Defines how many nested page levels should be examined. Infinity by default.
 * @returns {String|Array.<String>} options.exclusions A pattern or array of patterns to exclude links. Empty array by default
 * to not exclude anything.
 * @returns {Number} options.concurrency Number of concurrent pages (browser tabs) to be used during crawling. By default all
 * links are opened one by one, sequentially (concurrency is 1).
 * @returns {Boolean} options.quit Terminates the scan as soon as an error is found. False (off) by default.
 */
function parseArguments( args ) {
	const config = {
		string: [
			'url',
			'depth',
			'exclusions',
			'concurrency'
		],

		boolean: [
			'docs',
			'manual',
			'spinner',
			'quit'
		],

		alias: {
			u: 'url',
			d: 'depth',
			e: 'exclusions',
			c: 'concurrency',
			q: 'quit'
		},

		default: {
			spinner: true
		}
	};

	const parsedOptions = minimist( args, config );

	if ( parsedOptions.docs && parsedOptions.manual ) {
		throw new Error( 'Mutually exclusive --docs and --manual arguments.' );
	}

	const defaultOptionsForDocs = minimist( [
		'-u', 'http://127.0.0.1:8080/ckeditor5/latest/',
		'-e', '/ckfinder/',
		'-e', '/api/',
		'-e', '/assets/',

		/**
		 * MathType has a WASM telemetry file that esbuild fails to generate. Because
		 * the code works fine without it, then we exclude the file from the scan.
		 */
		'-e', '/math-equations',
		'-c', DEFAULT_CONCURRENCY
	], config );

	const defaultOptionsForManual = minimist( [
		'-u', 'http://localhost:8125/',
		'-d', 1,
		'-c', DEFAULT_CONCURRENCY
	], config );

	const options = {};

	if ( parsedOptions.docs ) {
		Object.assign( options, defaultOptionsForDocs, parsedOptions );
	}

	if ( parsedOptions.manual ) {
		Object.assign( options, defaultOptionsForManual, parsedOptions );
	}

	if ( !options.url ) {
		throw new Error( 'Missing required --url argument.' );
	}

	if ( !isUrlValid( options.url ) ) {
		throw new Error( 'Provided --url argument is not a valid URL.' );
	}

	return {
		url: options.url,
		depth: options.depth ? Number( options.depth ) : Infinity,
		exclusions: options.exclusions ? toArray( options.exclusions ).filter( exclusion => exclusion.length > 0 ) : [],
		concurrency: options.concurrency ? Number( options.concurrency ) : 1,
		quit: Boolean( options.quit ),
		noSpinner: !options.spinner
	};
}
