// filepath: tests/run-all-tests.js
// AI-Powered Test Runner with Automated Documentation
// This script runs all tests and generates comprehensive reports

import { exec } from 'child_process';
import { promisify } from 'util';
import { AITestReporter } from './helpers/test-reporter.js';
import fs from 'fs';

const execAsync = promisify(exec);

async function runTests() {
  console.log('🤖 AI Testing Agent Starting...\n');
  console.log('📋 Running comprehensive test suite for GolfBuddy App');
  console.log('⏰ Started:', new Date().toLocaleString());
  console.log('─'.repeat(60) + '\n');

  const reporter = new AITestReporter();

  try {
    // Run Playwright tests
    console.log('🧪 Executing Playwright tests...\n');
    
    const { stdout, stderr } = await execAsync('npx playwright test --reporter=json', {
      cwd: process.cwd(),
      env: { ...process.env, CI: 'true' }
    });

    // Parse Playwright JSON output
    if (fs.existsSync('test-results/results.json')) {
      const results = JSON.parse(fs.readFileSync('test-results/results.json', 'utf-8'));
      
      // Process results
      if (results.suites) {
        results.suites.forEach(suite => {
          suite.specs.forEach(spec => {
            spec.tests.forEach(test => {
              const status = test.results[0]?.status || 'unknown';
              const duration = test.results[0]?.duration || 0;
              const error = test.results[0]?.error?.message || null;
              const screenshots = test.results[0]?.attachments
                ?.filter(a => a.name === 'screenshot')
                ?.map(a => a.path) || [];

              reporter.recordTest(
                spec.title,
                suite.title,
                status === 'passed' ? 'passed' : status === 'skipped' ? 'skipped' : 'failed',
                duration,
                error,
                screenshots
              );
            });
          });
        });
      }
    }

    console.log('\n✅ Test execution complete!');
    console.log('─'.repeat(60) + '\n');

  } catch (error) {
    console.error('⚠️ Some tests failed or encountered errors');
    console.log('─'.repeat(60) + '\n');
  }

  // Generate reports
  console.log('📊 Generating AI-powered test reports...\n');
  
  const reportPath = reporter.saveReport();
  const jsonReport = reporter.generateJSONReport();

  console.log('✅ Reports generated successfully!\n');
  console.log('📄 Markdown Report:', reportPath);
  console.log('📄 JSON Report:', reportPath.replace('.md', '.json'));
  console.log('\n' + '─'.repeat(60));

  // Summary
  const summary = jsonReport.summary;
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests:   ${summary.total}`);
  console.log(`✅ Passed:     ${summary.passed}`);
  console.log(`❌ Failed:     ${summary.failed}`);
  console.log(`⏭️  Skipped:    ${summary.skipped}`);
  console.log(`⏱️  Duration:   ${summary.duration.toFixed(2)}s`);
  console.log(`📈 Pass Rate:  ${((summary.passed / summary.total) * 100).toFixed(1)}%\n`);

  if (summary.failed > 0) {
    console.log('⚠️  Action Required: Fix failing tests before deployment\n');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed! Application is ready.\n');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
