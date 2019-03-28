/**
 * @author James Jacob Kurian
 */

const AWS = require('aws-sdk')
const path = require('path')
const fs = require('fs')
const s3 = new AWS.S3();

/**
 *  User configurable params
 */
let arguments = process.argv.splice(2);
const bucketName =  arguments[0] // <INSERT YOUR BUCKET NAME HERE>
const downloadDir = arguments[1] + '/' //<INSERT YOUR DATA PATH HERE>

let currSubdir = null

function saveToLocalDrive(data, objParams) {
    /**
     * Resolve the directory path and create a directory if it is not present
     */
    // let dirpath = path.resolve(__dirname, downloadDir)
    let dirpath = process.cwd() + "/" + downloadDir
    if (!fs.existsSync(dirpath)) {
        fs.mkdirSync(dirpath)
    }
    
    /**
     * Ensure that the file name does not contain special characters. Modify as needed.
     */
    console.log(objParams.Key)
    if(objParams.Key.endsWith('/')) {
        console.log("Is a directory")

        let subdirName = objParams.Key.replace(/[<>:"\/\\|?*\x00+]/gm,'-')
        subdirName = subdirName.substring(0, subdirName.length - 1);

        let subdirpath = dirpath + "/" + subdirName

        if (!fs.existsSync(subdirpath)) {
            fs.mkdirSync(subdirpath)
        }

        currSubdir = subdirName 

    } else {
        let fileName = objParams.Key.replace(/[<>:"\/\\|?*\x00+]/gm,'-')
        let filePath = null

        if(fileName.includes(currSubdir)) {
            console.log(currSubdir)
            fileName = fileName.replace(currSubdir + "-", '')
            filePath = dirpath + "/" + currSubdir + "/" + fileName
        } else {
            filePath = dirpath + "/" + fileName
        }

        /**
         * Write data to the file
         */
        try {
            fs.writeFileSync(filePath, data)
            console.log(`${filePath} created.`)
            return true
        } catch (error) {
            throw new Error(`Failed to save file: ${filePath}`)
        }
    }
}

async function getDataFromS3(s3objects) {

    /**
     * If not data is provided
     */
    if(s3objects == null) {
        throw new Error("No data provided to fetch")
    }

    console.log(`Getting data from S3...`)

    /**
     * Parameters to pass to getObject()
     * The bucket name remains the same but the key value changes during each iteration the following for-loop
     */
    let objParams = {
        Bucket: bucketName,
        Key: null
    }

    /**
     * Loop through the list, fetch each object and save it to the local drive
     */
    try {
        for (let elementIndex in s3objects['Contents']) {
            let element = s3objects['Contents'][elementIndex]
            objParams.Key = element['Key']
            const data = await s3.getObject(objParams).promise()
            saveToLocalDrive(data.Body.toString(), objParams) 
        }      
    } catch (error) {
        console.error(error, error.stack)
        throw new Error(error)
    }

    return true
}

let s3download = async function downloadData() {
    let s3objects = null

    /**
     * List the objects first
     */
    try {
        let params = {
            Bucket: bucketName
        }
        console.log(`List objects operation in progress...`)
        s3objects = await s3.listObjectsV2(params).promise()
        console.log("List data operation successful.") 
    } catch (error) {
        console.error(error, error.stack)
    }

    /**
     * Fetch the objects one at a time using the list generated earlier
     */
    try {
        await getDataFromS3(s3objects) 
        console.log("Download data operation successful.")
    } catch (error) {
        console.error(error, error.stack)
    }
}

exports.s3download = s3download;