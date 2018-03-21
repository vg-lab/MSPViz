#Copyright (c) 2017 CCS/GMRV/UPM/URJC.

#Authors: Juan P. Brito <juanpedro.brito@upm.es>
#			Nicusor Cosmin Toader <cosmin.toader.nicu@gmail.com> 

#This library is free software; you can redistribute it and/or modify it under
#the terms of the GNU Lesser General Public License version 3.0 as published
#by the Free Software Foundation.

#This library is distributed in the hope that it will be useful, but WITHOUT
#ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
#FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public License for more
#details.

#You should have received a copy of the GNU Lesser General Public License
#along with this library; if not, write to the Free Software Foundation, Inc.,
#51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

"""
Options for the script:
-h -> help
-d pathDirectory ->Working directory, with all the simulation files
"""

import io, json, random
import sys
import getopt

gWorkingDirectory='.\\'

gNumExtNeurons  =   0
gNumInhNeurons  =   0

gSimSteps       =   []
gNumSimSteps    =   0

gMaxCalcium     =   0
gMinCalcium     =   0

gMaxECalcium     =   0
gMinECalcium     =   0

gMaxICalcium     =   0
gMinICalcium     =   0

HResol  =   1280
VResol  =   600

#Format "value (as,as,as)"
#Calciums, and at the moment, the interval Ids of each population of neurons
gCalciumFiles=[
               "calcium__e.dat"
               ,"calcium__i.dat"
               ]

#Info for the pies
gSynapticElements={"se_axn_ex_vacant.dat"           :"AxSeV"   #(E)Table with all the axonal excitatory synaptic elements of every neuron of the excitatory population (free + connected) at each recording time of the simulation        
                    ,"se_axn_ex_connected.dat"      :"AxSeC"   #(E)Table with connected the axonal excitatory synaptic elements of every neuron of the excitatory population at each recording time of the simulation                     
                    ,"se_axn_in_i_vacant.dat"       :"AxSeV"   #Table with all the axonal inhibitory synaptic elements of every neuron of the inhibitory population (free + connected) at each recording time of the simulation        
                    ,"se_axn_in_i_connected.dat"    :"AxSeC"   #Table with connected the axonal inhibitory synaptic elements of every neuron of the inhibitory population at each recording time of the simulation                     
                    ,"se_den_ex_vacant.dat"         :"DeSeEV"  #(E)Table with all the dendritic excitatory synaptic elements of every neuron of the excitatory population (free + connected) at each recording time of the simulation     
                    ,"se_den_ex_connected.dat"      :"DeSeEC"  #(E)Table with connected the dendritic excitatory synaptic elements of every neuron of the excitatory population at each recording time of the simulation                  
                    ,"se_den_ex_i_vacant.dat"       :"DeSeEV"  #Table with all the dendritic excitatory synaptic elements of every neuron of the inhibitory population (free + connected) at each recording time of the simulation     
                    ,"se_den_ex_i_connected.dat"    :"DeSeEC"  #Table with connected the dendritic excitatory synaptic elements of every neuron of the inhibitory population at each recording time of the simulation                  
                    ,"se_den_in_vacant.dat"         :"DeSeIV"  #(E)Table with all the dendritic inhibitory synaptic elements of every neuron of the excitatory population (free + connected) at each recording time of the simulation     
                    ,"se_den_in_connected.dat"      :"DeSeIC"  #(E)Table with connected the dendritic inhibitory synaptic elements of every neuron of the excitatory population at each recording time of the simulation                  
                    ,"se_den_in_i_vacant.dat"       :"DeSeIV"  #Table with all the dendritic inhibitory synaptic elements of every neuron of the inhibitory population (free + connected) at each recording time of the simulation     
                    ,"se_den_in_i_connected.dat"    :"DeSeIC"  #Table with connected the dendritic inhibitory synaptic elements of every neuron of the inhibitory population at each recording time of the simulation                  
                    }

gSynapticElementsAll={  "AxSeA"  :["AxSeV", "AxSeC"]         
                        ,"DeSeEA":["DeSeEV", "DeSeEC"]     
                        ,"DeSeIA":["DeSeIV", "DeSeIC"]     
                        }

def parseLocalNeuronInformationFiles(pWorkingDirectory, pCalciumsFiles, pSynapticElementFiles):
    
    JSONContainer   =   []
    lPreNeurons     =   0;
    lPopulationId   =   0;

    global gSimSteps    
    firstFile = True
    
    #Calcium files
    for i in range(0,len(pCalciumsFiles)):
        
        pFile   = pCalciumsFiles[i]
        f       = open(pWorkingDirectory+pFile)
        lines   = f.readlines()
        f.close()
    
        global gMinCalcium
        global gMaxCalcium
        global HResol
        global VResol
    
        global gMaxECalcium
        global gMinECalcium
        global gMaxICalcium
        global gMinICalcium
    
    
        #Flag to count the number of elements     
        firstLine=True
        
        for line in lines:
            line    = line.translate(None, '[()],')
            columns = line.split()

            if firstFile:
                gSimSteps.append(int(float(columns[0])))

            #First line generate the number of entrys in the vector (Num Neurons)
            #First element is the simulation step
            if firstLine:
                for j in range (1, len(columns)):                        

                    JSONTmpElement={"NId":lPreNeurons+(j-1)}            
                    
                    lActivity="I"
                    if lPopulationId%2==0:
                        lActivity="E"                                            
                    JSONTmpElement["NAct"]=lActivity
                    
                    JSONTmpElement["PopId"] =   lPopulationId

                    JSONTmpElement["PosX"]  =   random.randint(1, HResol)
                    JSONTmpElement["PosY"]  =   random.randint(1, VResol)
                                        
                    JSONTmpElement["Calcium"]=[float(columns[j])]
                    JSONContainer.append(JSONTmpElement)                

					#Calculate the max and min calcium values
                    if float(columns[j])<gMinCalcium:   gMinCalcium=float(columns[j])
                    if float(columns[j])>gMaxCalcium:   gMaxCalcium=float(columns[j])

                    if pCalciumsFiles[i]=="calcium__e.dat":
                        if float(columns[j])<gMinECalcium:   gMinECalcium=float(columns[j])
                        if float(columns[j])>gMaxECalcium:   gMaxECalcium=float(columns[j])
                    else:
                        if float(columns[j])<gMinICalcium:   gMinICalcium=float(columns[j])
                        if float(columns[j])>gMaxICalcium:   gMaxICalcium=float(columns[j])
                        
                
                firstLine=False;
            else:
                for j in range (1, len(columns)):
					#Calculate the max and min calcium values                    
                    if float(columns[j])<gMinCalcium:   gMinCalcium=float(columns[j])
                    if float(columns[j])>gMaxCalcium:   gMaxCalcium=float(columns[j])

                    if pCalciumsFiles[i]=="calcium__e.dat":
                        if float(columns[j])<gMinECalcium:   gMinECalcium=float(columns[j])
                        if float(columns[j])>gMaxECalcium:   gMaxECalcium=float(columns[j])
                    else:
                        if float(columns[j])<gMinICalcium:   gMinICalcium=float(columns[j])
                        if float(columns[j])>gMaxICalcium:   gMaxICalcium=float(columns[j])
                    
                    JSONTmpElement=float(columns[j])
                    JSONContainer[lPreNeurons+(j-1)]["Calcium"].append(JSONTmpElement)
                
        if pCalciumsFiles[i]=="calcium__e.dat":
            global gNumExtNeurons
            gNumExtNeurons = len(JSONContainer)
        else:
            global gNumInhNeurons
            gNumInhNeurons = len(JSONContainer)-lPreNeurons
        
        firstFile   =   False
        lPreNeurons =   len(JSONContainer);
        lPopulationId+=1

    #Synaptic Element files
    for i in range(0,len(pSynapticElementFiles)):
          
        pFile   = pSynapticElementFiles.keys()[i]
        f       = open(pWorkingDirectory+pFile)
        lines   = f.readlines()
        f.close()
      
        lToken=pSynapticElementFiles[pFile]
 
        firstIteration  = True
        prevId          =   -1;
 
        for line in lines:
            columns = line.split()
         
            if firstIteration:
                if "_vacant" in pFile:
                    JSONContainer[int(columns[0])][lToken]=[float(columns[2])]
                else:
                    JSONContainer[int(columns[0])][lToken]=[int(columns[2])]
                                  
                #Restarting
                if int(columns[0])<prevId:
                    firstIteration  =   False;
                else:
                    prevId=int(columns[0])
            else:
                if "_vacant" in pFile:                                            
                    JSONContainer[int(columns[0])][lToken].append(float(columns[2])) 
                else:                    
                    JSONContainer[int(columns[0])][lToken].append(int(columns[2])) 

    #Set points
    f       = open(pWorkingDirectory+"setpoints_per_neuron.dat")
    lines   = f.readlines()
    f.close()
    for line in lines:
        columns = line.split()
        JSONContainer[int(columns[0])]["SetPoint"]=float(columns[1])                                          

    #Number of vectors to fill     
    lKeys = gSynapticElementsAll.keys()
    for i in range(0,3):
        lToken = lKeys[i]
        #Id of neuron
        for j in range(0,len(JSONContainer)):
            JSONContainer[j][lToken]=[(float( JSONContainer[j][( gSynapticElementsAll[lToken][0])][0] ) 
                                                + float( JSONContainer[j][( gSynapticElementsAll[lToken][1])][0]) )]

            #Each element of the neuron
            for k in range(1,len(JSONContainer[0][( gSynapticElementsAll[lToken][0])])):
                JSONContainer[j][lToken].append(float( JSONContainer[j][( gSynapticElementsAll[lToken][0]) ][k] )
                                                +float( JSONContainer[j][( gSynapticElementsAll[lToken][1]) ][k] ) )
       
    with io.open(pWorkingDirectory+"LocalNeuronInformation"+'.json', 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(JSONContainer,  separators=(',', ': '), ensure_ascii=False)))

#Format "[as,as ... as]"
#Global information about the connections during the simulation
gFilesGlobalParams={"All_ex_connections.dat"        :"TEConn"                    
                    ,"All_inh_connections.dat"      :"TIConn"
                    ,"Ex_to_Ex_connections.dat"     :"EEConn"
                    ,"Ex_to_Inh_connections.dat"    :"EIConn"
                    ,"Inh_to_Ex_connections.dat"    :"IEConn"
                    ,"Inh_to_Inh_connections.dat"   :"IIConn"
                    }

#Formato "[as,as ... as]"
def parseGlobalParams(pWorkingDirectory, pFileContainer):

    global gSimSteps
    global gMaxCalcium
    global gMinCalcium
    
    global gMaxECalcium
    global gMinECalcium
    global gMaxICalcium
    global gMinICalcium
    
	#Maximos y minimos globales
    JSONContainer={"simSteps":gSimSteps}    
    JSONContainer["maxCalciumValue"]=gMaxCalcium
    JSONContainer["minCalciumValue"]=gMinCalcium

	#Maximos y minimos locales
    JSONContainer["maxECalciumValue"]=gMaxECalcium
    JSONContainer["minECalciumValue"]=gMinECalcium
    JSONContainer["maxICalciumValue"]=gMaxICalcium
    JSONContainer["minICalciumValue"]=gMinICalcium
    
    for i in range(0,len(pFileContainer)):
                
        pFile = pFileContainer.keys()[i]
        f = open(pWorkingDirectory+pFile)
        lines = f.readlines()
        f.close()
        
        #Only one line
        for line in lines:
            #Delete special characters
            line = line.translate(None, '[],')
            columns = line.split()

            #Vectorize the elements            
            lElementsContainer=[]    
            for j in range (0, len(columns)):                        
                lElementsContainer.append(int(columns[j])) 

			# Export as a dictionary (Easy to parse)
            JSONContainer[pFileContainer[pFile]]=lElementsContainer

    with io.open(pWorkingDirectory+"GlobalSimulationParams"+'.json', 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(JSONContainer, separators=(',', ': '), ensure_ascii=False)))


#Format "value value value"
#Info para las lineas de union de objetos (flechas rojas y azules->)
gConnectivityFiles={ "directed_conns_e_e.dat" :"EE"
                    ,"directed_conns_e_i.dat":"EI"
                    ,"directed_conns_i_e.dat":"IE"
                    ,"directed_conns_i_i.dat":"II"
                   }

#Formato "value value value"
def parseConnectivity(pWorkingDirectory, pConnectivityFiles):
        
    JSONContainer={}
        
    for i in range(0,len(pConnectivityFiles)):
                
        pFile   = pConnectivityFiles.keys()[i]
        f       = open(pWorkingDirectory+pFile)
        lines   = f.readlines()
        f.close()

        lToken=pConnectivityFiles[pFile]
    
        prevToken = -1
        
        JSONTmpContainer={}
        for line in lines:        
            columns = line.split()
            if prevToken!=int(float(columns[0])):
                JSONTmpContainer[int(float(columns[0]))]=[[int(columns[1]),int(columns[2])]]
                prevToken=int(float(columns[0]))
            else:
                JSONTmpContainer[int(float(columns[0]))].append([int(columns[1]),int(columns[2])])

                
        JSONContainer[lToken]=JSONTmpContainer
                        
    with io.open(pWorkingDirectory+"Connectivity"+'.json', 'w', encoding='utf-8') as f:
        f.write(unicode(json.dumps(JSONContainer, sort_keys=True, separators=(',', ': '), ensure_ascii=False)))

####################################################################################
#                        Generate files                                            #
####################################################################################

def main():
    
    global gWorkingDirectory
    global gCalciumFiles
    global gSynapticElements
    global gSynapticElementsAll
    global gFilesGlobalParams
    global gConnectivityFiles

    try:
        opts, args = getopt.getopt(sys.argv[1:], "hd:v", ["help", "directory="])
    except getopt.GetoptError as err:
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
        elif o in ("-d", "--directory"):
            gWorkingDirectory=a+"\\"
            try:            
                if verbose: print "Generating LocalNeuronInformationFile"
                parseLocalNeuronInformationFiles(gWorkingDirectory, gCalciumFiles, gSynapticElements)
                
                if verbose: print "Generating GlobalParamsFile"
                parseGlobalParams(gWorkingDirectory,gFilesGlobalParams)
                
                if verbose: print "Generating ConnectivityFile"
                parseConnectivity(gWorkingDirectory,gConnectivityFiles)
            except  (RuntimeError, TypeError, NameError):
                print "Exception has ocurred, please be sure you have all the files of the simulation with the standar file name."
                sys.exit(2)                        
        else:
            assert False, "unhandled option"

if __name__ == "__main__":
    main()
