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

def changePosLocalParams(pWorkingDirectory):
    
    lPath = pWorkingDirectory+'LocalNeuronInformation.json'
    
    with open(lPath) as data_file:    
        data = json.load(data_file)
        
    JSONContainer=[]
    
    gTotalNumEles = len(data)
    
    for k in range (0, gTotalNumEles):
        JSONTmpElement={"NAct":data[k]['NAct']}                        
        JSONTmpElement["PopId"]     =data[k]['PopId']
        JSONTmpElement["NId"]       =data[k]['NId']
        JSONTmpElement["SetPoint"]  =data[k]['SetPoint']
        if data[k]['NId']==590:
            JSONTmpElement["PosX"]      =data[k]['PosX']-40
            JSONTmpElement["PosY"]      =data[k]['PosY']+25      
        elif data[k]['NId']==736:
            JSONTmpElement["PosX"]      =data[k]['PosX']+50
            JSONTmpElement["PosY"]      =data[k]['PosY']         
        elif data[k]['NId']==300:
            JSONTmpElement["PosX"]      =data[k]['PosX']-40
            JSONTmpElement["PosY"]      =data[k]['PosY']-80         
        elif data[k]['NId']==779:
            JSONTmpElement["PosX"]      =data[504]['PosX']+30
            JSONTmpElement["PosY"]      =data[504]['PosY']
        elif data[k]['NId']==126:
            JSONTmpElement["PosX"]      =data[529]['PosX']
            JSONTmpElement["PosY"]      =data[529]['PosY']-35    
        
        else:
            JSONTmpElement["PosX"]      =data[k]['PosX']
            JSONTmpElement["PosY"]      =data[k]['PosY']         

        JSONContainer.append(JSONTmpElement)            
    
    lFileName = "LocalNeuronCommonInfo"+'.json'
    lPathFile = pWorkingDirectory+lFileName
    with io.open(lPathFile, 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

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
                if verbose: print "Adjusting positions"
                changePosLocalParams(gWorkingDirectory)
               
#                 if verbose: print "Spliting GlobalParamsFile"
#                 splitGlobalParams(gWorkingDirectory)
# 
#                 if verbose: print "Spliting Connectivity"
#                 splitConnectivity(gWorkingDirectory)
                
#                 lPathFile = gWorkingDirectory+'_SimulationFiles.json.scf'
#                 with io.open(lPathFile, 'w', encoding='utf-8') as f:
#                     f.write(unicode(json.dumps(gJSONSimulConfigFiles, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

                print "Finished."
            except  (RuntimeError, TypeError, NameError):
                print "Exception has ocurred, please be sure you have all the files of the simulation with the standar file name."
                sys.exit(2)                        
        else:
            assert False, "unhandled option"

if __name__ == "__main__":
    main()
