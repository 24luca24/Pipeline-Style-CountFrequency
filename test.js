const os = require('os');
const shell = require('shelljs');
const argv = require('yargs')
  .option(
    {'size': {
               alias: 's',
               describe: 'Size of the test',
               choices: ['small', 'large'],
               default: 'small'
             },
     'lang': {
               alias: 'l',
               describe: 'Language of program to test',
               choices: ['java', 'javascript', 'other'],
               default: 'java'
             },
     'main': {
               alias: 'm',
               describe: 'Main Java class or JavaScript file or command to run',
               default: 'TermFrequency'
             }
  })
  .argv

if (argv.lang == 'java') {
  console.log('==> Compiling Java classes');
  shell.exec('javac *.java');
}

const commandName = {'java': 'java', 'javascript': 'node', 'other': ''};
const inputFile = ['input-', argv.size, '.txt'].join('');

const expected =
  {
    'small': [
             'live  -  2',
             'mostly  -  2',
             'africa  -  1',
             'india  -  1',
             'lions  -  1',
             'tigers  -  1',
             'white  -  1',
             'wild  -  1'
    ],
    'large': [
             'mr  -  786',
             'elizabeth  -  635',
             'very  -  488',
             'darcy  -  418',
             'such  -  395',
             'mrs  -  343',
             'much  -  329',
             'more  -  327',
             'bennet  -  323',
             'bingley  -  306',
             'jane  -  295',
             'miss  -  283',
             'one  -  275',
             'know  -  239',
             'before  -  229',
             'herself  -  227',
             'though  -  226',
             'well  -  224',
             'never  -  220',
             'sister  -  218',
             'soon  -  216',
             'think  -  211',
             'now  -  209',
             'time  -  203',
             'good  -  201'
    ]
  };

// Try with 2 and 25 (these values for our inputs do not cross the boundary between words with the same frequency, which might be reported in any order)
for (const outputSize of [2, 25]) {
    const command = [commandName[argv.lang], argv.main, inputFile, outputSize.toString()].join(' ');

    // run the program
    console.log('==> Running \"' + command + '\"');
    const executionResult = shell.exec(command);

    // check if the program ran successfully
    if (executionResult.code != 0) {
        console.error('Test failed: the program did not run successfully.');
        process.exit(1);
    }

    const stdout = executionResult.stdout;

    /**
     * Function to sort the produced output numerically by second column and as a second key
     * lexicographically by first column.
     */
    const byFreqAndAlpha = function(a, b) {
      if (b[1] - a[1] != 0) {
        // Sort first by number.
        return b[1] - a[1];
      } else {
        // Sort second by name. Names can be compared but not subtracted.
        if (a[0] < b[0]) {
          return -1;
        } else if (a[0] > b[0]) {
          return 1;
        } else {
          return 0;
        }
      }
    };

    const sort = function(rawOutput, sortCriteria) {
      return rawOutput
        .trim()
        .split(os.EOL)
        .map(line => line.split('  -  '))
        .sort(sortCriteria)
        .map(x => x.join('  -  '));
    }

    const outputSortedByFreqAndAlpha = sort(stdout, byFreqAndAlpha);
    const outputSortedByFreq = sort(stdout, (a, b) => b[1] - a[1]);

    console.log('==> Checking output');

    const firstN = a => a.slice(0, outputSize).join(os.EOL);

    const limitedOutput = firstN(stdout.trim().split(os.EOL));

    const limitedOutputSortedByFreq = firstN(outputSortedByFreq);
    const limitedOutputSortedByFreqAndAlpha = firstN(outputSortedByFreqAndAlpha);
    const limitedExpected = firstN(expected[argv.size]);

    if (stdout.trim().split(os.EOL).length != limitedExpected.split(os.EOL).length) {
        console.error('Test failed: the number of lines in your output does not match the provided command-line argument.');
        process.exit(1);
    }


    // First compare raw output with output sorted only by frequency to know if it's sorted.
    if (limitedOutput != limitedOutputSortedByFreq) {
      console.error('Test failed. Hint: your output should be sorted by frequency in descending order.');
      process.exit(1);

    // Once we know it's sorted by frequency, we sort both by frequency and alphabetically
    // so we can have an exact comparison with the reference solution.
    } else if (limitedExpected === limitedOutputSortedByFreqAndAlpha) {
      console.log('ok');

    } else {
      const msg = ['Test failed. Expected:', limitedExpected, 'but found:', stdout.trim()].join(os.EOL);
      console.error(msg);
      process.exit(1);
    }

}
