# AWS S3 Downloader

## Why this package?
- This package is intended to be used when you want to download files from S3 to a Windows machine but the file names contain reserved characters and so, neither the AWS CLI nor the available AWS SDKs download the files. Have a look at this issue: [Issue with downloading s3 objects on Windows](https://github.com/aws/aws-cli/issues/1154)

- Do not upload the files and folders back to S3 after downloading them using this package since the uploaded files will have different names and will exist side-by-side along with the original files (unless you are sure of what you are doing).

## What this package does
- This package downloads all the objects in a specified S3 bucket into a local directory.
- While downloading the files, the script replaces reserved characters in the filename for Windows with dashes (-) to prevent issues.
- It converts the following reserved characters:
```
    < (less than)
    > (greater than)
    : (colon)
    " (double quote)
    / (forward slash)
    \ (backslash)
    | (vertical bar or pipe)
    ? (question mark)
    * (asterisk)
    \x00 (ASCII NUL)
```
- The reserved characters are based on [Naming Files, Paths, and Namespaces](https://docs.microsoft.com/en-us/windows/desktop/fileio/naming-a-file)

## How to install
Install this package globally
```
npm i -g @jamesjacobk/awss3downloader
```

## Prerequisites
The script assumes that the AWS CLI is setup with the correct credentials

## How to use:
On a terminal run:
```
s3dl <bucketname> <folder>
```
`folder` is the folder you want to download the objects to **relative to the current path**.

### Example
```
s3dl test-bucket data
```
This will download all the objects in the `test-bucket` bucket into the `data` folder **relative to the current directory**.

### Known issues
- The 'directory' structure from S3 might not be reflected in the local drive, i.e., the files might appear outside their 'directory' with the directory name prefixed to the name of the file.