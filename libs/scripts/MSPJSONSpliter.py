"""
Options for the script:
-v -> Verbose mode
-h -> help
-d pathDirectory ->Working directory, with all the simulation files
-n timesteps to split
"""

## @brief
# @author  Juan Pedro Brito Mendez <juanpebm@gmail.com>
# @date
# @remarks Do not distribute without further notice.
import io, json
import sys
import getopt
import collections

gWorkingDirectory           =   '.\\'
gGlobalFilesRootName        =   'GlobalParams_'
gLocalFilesRootName         =   'LocalParams_'
gConnectivityFilesRootName  =   'Connectivity_'


gItemsPerFile               =   250
gTotalSimulationSteps       =   0
gBufferSimulationSteps      =   50

gTotalNumEles               =   0
gTotalNumFiles              =   0
gSimSteps                   =   [];

gTotalNumberOfNeurons       =   0

gJSONSimulConfigFiles       = collections.OrderedDict()

def splitGlobalParams(pWorkingDirectory):
    
    lPath = pWorkingDirectory+'GlobalSimulationParams.json'
    
    with open(lPath) as data_file:    
        data = json.load(data_file)
        
    global gSimSteps 
    gSimSteps = data['simSteps'];

    global gTotalSimulationSteps
    gTotalSimulationSteps = len(gSimSteps)
    
    global gBufferSimulationSteps
    
    JSONContainer={}
    JSONContainer['minCalciumValue']    =data['minCalciumValue'];    
    JSONContainer['maxCalciumValue']    =data['maxCalciumValue'];
    JSONContainer['minICalciumValue']   =data['minICalciumValue'];    
    JSONContainer['maxICalciumValue']   =data['maxICalciumValue'];
    JSONContainer['minECalciumValue']   =data['minECalciumValue'];
    JSONContainer['maxECalciumValue']   =data['maxECalciumValue'];

    JSONContainer['simSteps']               =data['simSteps'];   
    JSONContainer['totalSimulationSteps']   =gTotalSimulationSteps;
    JSONContainer['numSimStepsPerFile']     =gItemsPerFile;
    JSONContainer['bufferSimulationSteps']  =gBufferSimulationSteps;

    JSONContainer['numFiles']           =gTotalNumFiles;

    lPathFile = pWorkingDirectory+"GlobalSimulationParamsV2.json"
    with io.open(lPathFile, 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))
    
    gJSONSimulConfigFiles['GlobalSimulationParams']="GlobalSimulationParamsV2.json"
    
    for i in range (0, gTotalNumFiles):
        lIncrement = i*gItemsPerFile;
        
        JSONContainer={}
        lNumElesInFile=0
        
        if i!=(gTotalNumFiles-1):
            lNumElesInFile=gItemsPerFile
        else:
            lNumElesInFile=len(data['EIConn']) - (i*gItemsPerFile)
            
        for j in range (0, lNumElesInFile):
            if j!=0:
                JSONContainer['EIConn'].append(data['EIConn'][lIncrement+j]);
                JSONContainer['TEConn'].append(data['TEConn'][lIncrement+j]);
                JSONContainer['IEConn'].append(data['IEConn'][lIncrement+j]);
                JSONContainer['IIConn'].append(data['IIConn'][lIncrement+j]);
                JSONContainer['EEConn'].append(data['EEConn'][lIncrement+j]);
                JSONContainer['TIConn'].append(data['TIConn'][lIncrement+j]);                
            else:
                print "Index:"+str(lIncrement+j)
                JSONContainer['EIConn']=[data['EIConn'][lIncrement+j]];
                JSONContainer['TEConn']=[data['TEConn'][lIncrement+j]];
                JSONContainer['IEConn']=[data['IEConn'][lIncrement+j]];
                JSONContainer['IIConn']=[data['IIConn'][lIncrement+j]];
                JSONContainer['TIConn']=[data['TIConn'][lIncrement+j]];
                JSONContainer['EEConn']=[data['EEConn'][lIncrement+j]];

        lFileName = "GlobalParams_"+str(i)+'.json'
        lPathFile = pWorkingDirectory+lFileName
        
        with io.open(lPathFile, 'w', encoding='utf-8') as f:
            f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

        if i==0: gJSONSimulConfigFiles['GlobalParams']=[lFileName]
        else:    gJSONSimulConfigFiles['GlobalParams'].append(lFileName)

def _compare_keys(x, y):
    try:
        x = int(x)
    except ValueError:
        xint = False
    else:
        xint = True
    try:
        y = int(y)
    except ValueError:
        if xint:
            return -1
        return cmp(x.lower(), y.lower())
        # or cmp(x, y) if you want case sensitivity.
    else:
        if xint:
            return cmp(x, y)
        return 1

def splitConnectivity(pWorkingDirectory):

    lPath = pWorkingDirectory+'Connectivity.json'
    
    with open(lPath) as data_file:    
        data = json.load(data_file)

#    gSimSteps           =   data['simSteps'];
    lMaxNumElesInFile   =   gItemsPerFile
    
    lEEKeys = sorted(data["EE"].keys(), cmp=_compare_keys)
    lEIKeys = sorted(data["EI"].keys(), cmp=_compare_keys)    
    lIEKeys = sorted(data["IE"].keys(), cmp=_compare_keys)
    lIIKeys = sorted(data["II"].keys(), cmp=_compare_keys)
    
    for i in range (0, gTotalNumFiles):
        lIncrement = i*gItemsPerFile;
#        print "--->>>> Iteracion:"+str(i)
        JSONContainer={}
        
        JSONContainer['EE'] = collections.OrderedDict()
        JSONContainer['IE'] = collections.OrderedDict()
        JSONContainer['EI'] = collections.OrderedDict()
        JSONContainer['II'] = collections.OrderedDict()
        
        for j in range (0, lMaxNumElesInFile):
            lActKey = str(gSimSteps[lIncrement+j])
#            print "Internal iteration:"+str(j)+" "+str(lActKey)
             
            if lActKey in lEEKeys:
                JSONContainer['EE'][lActKey]=data['EE'][lActKey]

            if lActKey in lIEKeys:
                JSONContainer['IE'][lActKey]=data['IE'][lActKey]

 
            if lActKey in lEIKeys:
                JSONContainer['EI'][lActKey]=data['EI'][lActKey]

 
            if lActKey in lIIKeys:
                JSONContainer['II'][lActKey]=data['II'][lActKey]

#        Falta ordenar la salida para que sea mas eficiente el acceso en javascript
#        Creo que con modificar el criterio de insercion ordenada valdria
        
        lFileName = "Connectivity_"+str(i)+'.json'
        lPathFile = pWorkingDirectory+lFileName
           
        with io.open(lPathFile, 'w', encoding='utf-8') as f:
            f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

        if i==0: gJSONSimulConfigFiles['Connectivity']=[lFileName]
        else:    gJSONSimulConfigFiles['Connectivity'].append(lFileName)


def splitLocalParams(pWorkingDirectory):
    
    lPath = pWorkingDirectory+'LocalNeuronInformation.json'
    
    with open(lPath) as data_file:    
        data = json.load(data_file)

    global gTotalNumEles   
    gTotalNumEles = len(data)
    
    global gTotalNumFiles
    global gItemsPerFile
    
    gTotalNumFiles = gTotalNumEles/gItemsPerFile
    
    if ((gTotalNumEles%gItemsPerFile)>0):
        gTotalNumFiles=gTotalNumFiles+1
        
    JSONContainer=[]
    
    for k in range (0, gTotalNumEles):
        JSONTmpElement={"NAct":data[k]['NAct']}                        
        JSONTmpElement["PopId"]     =data[k]['PopId']
        JSONTmpElement["NId"]       =data[k]['NId']
        JSONTmpElement["PosX"]      =data[k]['PosX']
        JSONTmpElement["PosY"]      =data[k]['PosY']
        JSONTmpElement["SetPoint"]  =data[k]['SetPoint']

        JSONContainer.append(JSONTmpElement)            
    
    lFileName = "LocalNeuronCommonInfo"+'.json'
    lPathFile = pWorkingDirectory+lFileName
    with io.open(lPathFile, 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))
    
    gJSONSimulConfigFiles['LocalNeuronCommonInfo']=lFileName
    
    for i in range (0, gTotalNumFiles):
        lIncrement = i*gItemsPerFile;
        
        JSONContainer=[]
        lNumElesInFile=0
        
        if i!=(gTotalNumFiles-1):
            lNumElesInFile=gItemsPerFile
        else:
            lNumElesInFile=len(data[0]['DeSeEV']) - (i*gItemsPerFile)
                
        for j in range (0, len(data)):
#             print "Increments: "+str(lIncrement)+" - lNumElesInFile:"+str(lIncrement+lNumElesInFile)
            JSONTmpElement={'DeSeEV':data[j]['DeSeEV'][lIncrement:lIncrement+lNumElesInFile]}
            JSONTmpElement['DeSeEA'] =data[j]['DeSeEA'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['DeSeIV'] =data[j]['DeSeIV'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['AxSeA']  =data[j]['AxSeA'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['AxSeC']  =data[j]['AxSeC'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['DeSeEC'] =data[j]['DeSeEC'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['DeSeIA'] =data[j]['DeSeIA'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['AxSeV']  =data[j]['AxSeV'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['DeSeIC'] =data[j]['DeSeIC'][lIncrement:lIncrement+lNumElesInFile];
            JSONTmpElement['Calcium']=data[j]['Calcium'][lIncrement:lIncrement+lNumElesInFile];
            
            JSONContainer.append(JSONTmpElement)                            

        lFileName = "LocalNeuronInfo_"+str(i)+'.json'
        lPathFile = pWorkingDirectory+lFileName
        
        with io.open(lPathFile, 'w', encoding='utf-8') as f:
            f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

        if i==0: gJSONSimulConfigFiles['LocalNeuronInfo']=[lFileName]
        else:    gJSONSimulConfigFiles['LocalNeuronInfo'].append(lFileName)

def main():
    
    global gWorkingDirectory
    global gGlobalFilesRootName
    global gLocalFilesRootName
    global gConnectivityFilesRootName
    global gItemsPerFile
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hd:vn", ["help", "directory="])
    except getopt.GetoptError as err:
        # print help information and exit:
        print str(err) # will print something like "option -a not recognized"
        print "for help use --help"
        sys.exit(2)

    verbose = False

    for o, a in opts:
        if o == "-v":
            verbose = True
        elif o in ("-h", "--help"):
            print __doc__
            sys.exit()
        elif o in ("-n", "--num"):
            gItemsPerFile = a
        elif o in ("-d", "--directory"):
            gWorkingDirectory=a+"\\"
            try:            
                if verbose: print "Spliting  LocalNeuronInformationFile"
                splitLocalParams(gWorkingDirectory)
                
                if verbose: print "Spliting GlobalParamsFile"
                splitGlobalParams(gWorkingDirectory)

                if verbose: print "Spliting Connectivity"
                splitConnectivity(gWorkingDirectory)
                
                lPathFile = gWorkingDirectory+'_SimulationFiles.json.scf'
                with io.open(lPathFile, 'w', encoding='utf-8') as f:
                    f.write(unicode(json.dumps(gJSONSimulConfigFiles, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

                print "Finished."
            except  (RuntimeError, TypeError, NameError):
                print "Exception has ocurred, please be sure you have all the files of the simulation with the standar file name."
                sys.exit(2)                        
        else:
            assert False, "unhandled option"

if __name__ == "__main__":
    main()
