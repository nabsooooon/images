import sys,glob
from PIL import Image
files=sorted(glob.glob(sys.argv[1]));out=sys.argv[2];cols=int(sys.argv[3]) if len(sys.argv)>3 else 3
ims=[Image.open(f) for f in files];w,h=ims[0].size;rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(cols*w+(cols-1)*6,rows*h+(rows-1)*6),(40,40,40))
for i,im in enumerate(ims):sheet.paste(im,((i%cols)*(w+6),(i//cols)*(h+6)))
sheet.save(out,quality=90);print(out,sheet.size,[f.split('/')[-1] for f in files])
